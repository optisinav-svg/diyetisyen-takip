# Cron Job Deployment Guide

## Genel Bakış

Diyetisyen Takip uygulaması aşağıdaki otomatik görevleri çalıştırmak için cron job'ları kullanır:

| Görev | Zaman | Frekans | Açıklama |
|-------|-------|---------|----------|
| Daily Exports | 02:00 | Her gün | Kullanıcıların günlük öğün ve performans raporlarını S3'e export eder |
| Weekly Reports | 09:00 Pazartesi | Haftada bir | Haftalık öğün raporlarını S3'e export eder ve push notification gönderir |
| Monthly Income | 08:00 1. gün | Ayda bir | Diyetisyenlerin aylık gelir raporlarını S3'e export eder |
| Export Cleanup | 03:00 | Her gün | 7 günden eski export'ları temizler |

---

## Kurulum Adımları

### 1. Environment Variables Ayarlama

Production sunucusunda `.env` dosyasını oluşturun:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/diyetisyen_takip

# AWS S3
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=diyetisyen-takip-exports

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your_expo_token

# Server
NODE_ENV=production
PORT=3000
```

### 2. Node.js ve pnpm Kurulumu

```bash
# Node.js 22.13.0+ kurulumu
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm kurulumu
npm install -g pnpm@9.12.0

# Bağımlılıkları yükleyin
cd /home/ubuntu/diyetisyen-takip
pnpm install
```

### 3. Production Build

```bash
# Build işlemini çalıştırın
pnpm build

# Build çıktısını kontrol edin
ls -la dist/
```

### 4. Systemd Service Oluşturma

`/etc/systemd/system/diyetisyen-takip.service` dosyasını oluşturun:

```ini
[Unit]
Description=Diyetisyen Takip Application
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/diyetisyen-takip
Environment="NODE_ENV=production"
EnvironmentFile=/home/ubuntu/diyetisyen-takip/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=diyetisyen-takip

[Install]
WantedBy=multi-user.target
```

### 5. Service Başlatma

```bash
# Service'i etkinleştirin
sudo systemctl enable diyetisyen-takip

# Service'i başlatın
sudo systemctl start diyetisyen-takip

# Status kontrol edin
sudo systemctl status diyetisyen-takip

# Logs kontrol edin
sudo journalctl -u diyetisyen-takip -f
```

---

## Cron Job Monitoring

### 1. Logs Kontrol Etme

```bash
# Application logs
sudo journalctl -u diyetisyen-takip -n 100

# Cron job logs
sudo grep CRON /var/log/syslog | tail -20

# Specific job logs
sudo journalctl -u diyetisyen-takip | grep "Daily exports"
```

### 2. Cron Job Status Endpoint

API'ye cron job status'unu kontrol etmek için endpoint eklenebilir:

```bash
curl http://localhost:3000/api/cron/status
```

Beklenen yanıt:
```json
{
  "status": "running",
  "jobs": {
    "dailyExports": {
      "lastRun": "2026-04-22T02:00:00Z",
      "nextRun": "2026-04-23T02:00:00Z",
      "status": "completed"
    },
    "weeklyReports": {
      "lastRun": "2026-04-21T09:00:00Z",
      "nextRun": "2026-04-28T09:00:00Z",
      "status": "completed"
    },
    "monthlyIncome": {
      "lastRun": "2026-04-01T08:00:00Z",
      "nextRun": "2026-05-01T08:00:00Z",
      "status": "completed"
    },
    "exportCleanup": {
      "lastRun": "2026-04-22T03:00:00Z",
      "nextRun": "2026-04-23T03:00:00Z",
      "status": "completed"
    }
  }
}
```

### 3. Error Monitoring

Cron job hataları için alerting kurun:

```bash
# Hata loglarını filtreleyin
sudo journalctl -u diyetisyen-takip | grep -i "error"

# Başarısız job'ları kontrol edin
sudo journalctl -u diyetisyen-takip | grep "failed"
```

---

## Troubleshooting

### Problem: Cron Job Çalışmıyor

**Çözüm 1: Service Status Kontrol Edin**
```bash
sudo systemctl status diyetisyen-takip
```

**Çözüm 2: Logs Kontrol Edin**
```bash
sudo journalctl -u diyetisyen-takip -n 50
```

**Çözüm 3: Environment Variables Kontrol Edin**
```bash
sudo systemctl cat diyetisyen-takip
```

### Problem: Database Bağlantısı Başarısız

**Çözüm:**
```bash
# Database bağlantısını test edin
psql $DATABASE_URL -c "SELECT 1"

# Connection pool ayarlarını kontrol edin
# server/_core/index.ts dosyasını kontrol edin
```

### Problem: S3 Upload Başarısız

**Çözüm:**
```bash
# AWS credentials kontrol edin
aws s3 ls

# S3 bucket permissions kontrol edin
aws s3api head-bucket --bucket diyetisyen-takip-exports

# IAM policy kontrol edin
aws iam get-user-policy --user-name cron-user --policy-name s3-access
```

### Problem: Memory Leak

**Çözüm:**
```bash
# Memory usage kontrol edin
ps aux | grep node

# Restart service
sudo systemctl restart diyetisyen-takip

# Automatic restart kurun (systemd ile yapılıyor)
```

---

## Backup ve Recovery

### 1. Database Backup

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/diyetisyen-takip"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Eski backupları sil (7 günden eski)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Cron job olarak ekleyin:
```bash
0 1 * * * /home/ubuntu/diyetisyen-takip/scripts/backup.sh
```

### 2. S3 Backup

```bash
# S3 exports'ları yedekleyin
aws s3 sync s3://diyetisyen-takip-exports s3://diyetisyen-takip-exports-backup --delete
```

### 3. Recovery

```bash
# Database recovery
psql $DATABASE_URL < /backups/diyetisyen-takip/backup_20260422_010000.sql

# S3 recovery
aws s3 sync s3://diyetisyen-takip-exports-backup s3://diyetisyen-takip-exports --delete
```

---

## Performance Optimization

### 1. Database Connection Pool

`server/_core/index.ts` dosyasında:

```typescript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Batch Processing

Büyük export'lar için batch processing kullanın:

```typescript
const BATCH_SIZE = 100;
for (let i = 0; i < users.length; i += BATCH_SIZE) {
  const batch = users.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}
```

### 3. Caching

Sık kullanılan verileri cache'leyin:

```typescript
const cache = new Map();
const getCachedUser = (id: number) => {
  if (cache.has(id)) return cache.get(id);
  const user = fetchUser(id);
  cache.set(id, user);
  return user;
};
```

---

## Security Best Practices

### 1. Environment Variables

- `.env` dosyasını `.gitignore`'a ekleyin
- Production secrets'ları güvenli bir yerde saklayın
- Regular olarak API keys'i rotate edin

### 2. Database Security

- Database user'ı minimum permissions ile oluşturun
- SSL connection kullanın
- Regular olarak backupları test edin

### 3. S3 Security

- IAM policy'yi restrict edin
- Bucket encryption'ı etkinleştirin
- Access logs'ı enable edin

### 4. Monitoring

- Error logs'ı regular olarak kontrol edin
- Performance metrics'ı izleyin
- Alerts kurun

---

## Checklist

- [ ] Environment variables ayarlandı
- [ ] Node.js ve pnpm kuruldu
- [ ] Production build başarılı
- [ ] Systemd service oluşturuldu
- [ ] Service başlatıldı ve çalışıyor
- [ ] Logs kontrol edildi
- [ ] Database bağlantısı çalışıyor
- [ ] S3 bağlantısı çalışıyor
- [ ] Cron jobs çalışıyor
- [ ] Monitoring kuruludu
- [ ] Backup script'i çalışıyor
- [ ] Security best practices uygulandı
