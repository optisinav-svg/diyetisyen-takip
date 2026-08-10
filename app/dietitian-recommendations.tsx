import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const REC_KEY="recommendations_v2";
const MSGS_KEY="chat_v3";

interface Rec{id:string;clientId:string;clientName:string;type:"recommendation"|"warning"|"praise";title:string;content:string;icon:string;createdAt:string;read:boolean;}

const TYPES=[
  {k:"recommendation",l:"💡 Öneri",color:"#3b82f6",bg:"#3b82f620",desc:"Beslenme ve yaşam tarzı önerisi"},
  {k:"warning",l:"⚠️ Uyarı",color:"#f97316",bg:"#f9731620",desc:"Dikkat edilmesi gereken durum"},
  {k:"praise",l:"🌟 Övgü",color:"#22c55e",bg:"#22c55e20",desc:"Başarı ve motivasyon mesajı"},
];

const TEMPLATES:Record<string,{title:string;content:string}[]>={
  recommendation:[
    {title:"Su Tüketimini Artır",content:"Günlük su tüketiminizi 2-2.5 litreye çıkarmaya çalışın. Sabah kalktığınızda bir bardak su içmek güzel bir alışkanlık olacak."},
    {title:"Omega-3 Alımı",content:"Haftada en az 2 kez balık tüketmenizi öneririm. Somon, uskumru veya sardine tercih edebilirsiniz."},
    {title:"Ara Öğün Planlaması",content:"Ana öğünler arasında sağlıklı ara öğünler ekleyin. Ceviz, badem veya meyve iyi seçenekler."},
  ],
  warning:[
    {title:"Şeker Tüketimi Yüksek",content:"Son haftalarda şeker ve şekerli içecek tüketiminizin arttığını gözlemledim. Bu durum hedeflerinizi olumsuz etkileyebilir."},
    {title:"Öğün Atlama",content:"Öğün atlamak metabolizmanızı yavaşlatabilir. Özellikle kahvaltıyı atlamayın."},
    {title:"Geç Saatte Yemek",content:"Gece geç saatte yemek yemeniz sindirim sorunlarına yol açabilir. Son öğünü en geç 20:00'de tamamlamaya çalışın."},
  ],
  praise:[
    {title:"Harika İlerleme!",content:"Bu haftaki beslenme planına uyumunuz mükemmeldi! Böyle devam edin, hedefinize yaklaşıyorsunuz."},
    {title:"Su Hedefi Başarısı",content:"Haftalık su hedefini tutturduğunuz için tebrikler! Bu sağlığınız için çok önemli bir adım."},
    {title:"Devam Edin!",content:"Son ölçümlerinize göre güzel bir ilerleme kaydettiniz. Motivasyonunuz harika, böyle devam!"},
  ],
};

export default function DietitianRecommendationsScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [recs,setRecs]=useState<Rec[]>([]);
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [tab,setTab]=useState<"list"|"create">("list");
  const [showForm,setShowForm]=useState(false);
  const [recType,setRecType]=useState<"recommendation"|"warning"|"praise">("recommendation");
  const [recTitle,setRecTitle]=useState("");const [recContent,setRecContent]=useState("");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const r=await AsyncStorage.getItem(REC_KEY);if(r)setRecs(JSON.parse(r));
  };
  const saveRecs=async(list:Rec[])=>{setRecs(list);await AsyncStorage.setItem(REC_KEY,JSON.stringify(list));};

  const sendRec=async()=>{
    if(!recTitle.trim()||!recContent.trim()){Alert.alert("Hata","Başlık ve içerik girin");return;}
    if(!selClient){Alert.alert("Hata","Danışan seçin");return;}
    const t=TYPES.find(x=>x.k===recType)!;
    const rec:Rec={id:Date.now().toString(),clientId:selClient.id,clientName:selClient.name,type:recType,title:recTitle,content:recContent,icon:t.l.split(" ")[0],createdAt:new Date().toISOString(),read:false};
    await saveRecs([rec,...recs]);
    // Mesaj olarak da gönder
    const msg={id:Date.now().toString(),senderId:"dietitian",senderName:"Diyetisyeniniz",content:`${rec.icon} ${rec.title}\n\n${rec.content}`,createdAt:new Date().toISOString(),status:"delivered"};
    const saved=await AsyncStorage.getItem(MSGS_KEY);const all=saved?JSON.parse(saved):{};
    all[selClient.id]=[...(all[selClient.id]??[]),msg];await AsyncStorage.setItem(MSGS_KEY,JSON.stringify(all));
    setRecTitle("");setRecContent("");setShowForm(false);
    Alert.alert("✅ Gönderildi",`${selClient.name}'a ${t.l} gönderildi ve mesaj olarak iletildi.`);
  };

  const markRead=(id:string)=>saveRecs(recs.map(r=>r.id===id?{...r,read:true}:r));
  const deleteRec=(id:string)=>Alert.alert("Sil","",[{text:"İptal",style:"cancel"},{text:"Sil",style:"destructive",onPress:()=>saveRecs(recs.filter(r=>r.id!==id))}]);

  const clientRecs=recs.filter(r=>role==="dietitian"?(!selClient||r.clientId===selClient.id):r.clientId==="me");
  const unread=clientRecs.filter(r=>!r.read).length;

  const TC=TYPES.find(x=>x.k===recType)!;

  return(<ScreenContainer>
    <BackButton title="💡 Diyetisyen Önerileri"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {role==="dietitian"&&<View style={{flexDirection:"row",gap:8}}>
        {[{k:"list",l:"📋 Gönderilenler"},{k:"create",l:"✉️ Yeni Gönder"}].map(t=>(
          <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
            <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>}

      {role==="client"&&unread>0&&<View style={{backgroundColor:"#22c55e20",borderRadius:10,padding:12,borderWidth:1,borderColor:"#22c55e"}}>
        <Text style={{color:"#22c55e",fontWeight:"600"}}>🔔 {unread} yeni mesajınız var</Text>
      </View>}

      {(role==="client"||tab==="list")&&(<>
        {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setSelClient(null)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:!selClient?colors.primary:colors.surface,borderWidth:1,borderColor:!selClient?colors.primary:colors.border}}>
              <Text style={{color:!selClient?"#fff":colors.foreground,fontWeight:"600"}}>👥 Tümü</Text>
            </TouchableOpacity>
            {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
              <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>}
        {clientRecs.length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Henüz öneri/uyarı yok.</Text>
          :clientRecs.map(r=>{const t=TYPES.find(x=>x.k===r.type)!;const d=new Date(r.createdAt);return(
            <View key={r.id} style={{backgroundColor:t.bg,borderRadius:14,padding:16,borderWidth:2,borderColor:t.color,gap:8,opacity:r.read?0.8:1}}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start"}}>
                <View style={{flex:1}}>
                  <View style={{flexDirection:"row",alignItems:"center",gap:8,marginBottom:4}}>
                    <View style={{paddingHorizontal:10,paddingVertical:3,borderRadius:8,backgroundColor:t.color+"30"}}>
                      <Text style={{fontSize:12,fontWeight:"700",color:t.color}}>{t.l}</Text>
                    </View>
                    {!r.read&&role==="client"&&<View style={{width:8,height:8,borderRadius:4,backgroundColor:t.color}}/>}
                  </View>
                  <Text style={{fontSize:15,fontWeight:"700",color:colors.foreground}}>{r.title}</Text>
                  {role==="dietitian"&&<Text style={{color:colors.muted,fontSize:12}}>👤 {r.clientName}</Text>}
                </View>
                {role==="dietitian"&&<TouchableOpacity onPress={()=>deleteRec(r.id)}><Text style={{color:"#ef4444",fontSize:12}}>Sil</Text></TouchableOpacity>}
              </View>
              <Text style={{color:colors.foreground,fontSize:14,lineHeight:22}}>{r.content}</Text>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{color:colors.muted,fontSize:11}}>📅 {d.getDate()}.{d.getMonth()+1}.{d.getFullYear()}</Text>
                {!r.read&&role==="client"&&<TouchableOpacity onPress={()=>markRead(r.id)} style={{paddingHorizontal:12,paddingVertical:4,borderRadius:8,backgroundColor:t.color}}>
                  <Text style={{color:"#fff",fontSize:12,fontWeight:"600"}}>✓ Okundu</Text>
                </TouchableOpacity>}
              </View>
            </View>
          );})}
      </>)}

      {role==="dietitian"&&tab==="create"&&(<>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
              <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>
        <View style={{flexDirection:"row",gap:8}}>
          {TYPES.map(t=>(<TouchableOpacity key={t.k} onPress={()=>setRecType(t.k as any)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:recType===t.k?t.color:colors.surface,borderWidth:2,borderColor:recType===t.k?t.color:colors.border}}>
            <Text style={{color:recType===t.k?"#fff":colors.foreground,fontWeight:"700",fontSize:12}}>{t.l}</Text>
          </TouchableOpacity>))}
        </View>
        <View style={{backgroundColor:TC.bg,borderRadius:10,padding:10,borderWidth:1,borderColor:TC.color}}>
          <Text style={{color:TC.color,fontSize:12}}>{TC.desc} · Mesaj olarak da gönderilir</Text>
        </View>
        <Text style={{fontWeight:"600",color:colors.foreground}}>Şablonlar:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {TEMPLATES[recType].map((t,i)=>(<TouchableOpacity key={i} onPress={()=>{setRecTitle(t.title);setRecContent(t.content);}}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:16,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,maxWidth:200}}>
              <Text style={{color:colors.foreground,fontSize:12,fontWeight:"600"}} numberOfLines={1}>{t.title}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>
        <TextInput value={recTitle} onChangeText={setRecTitle} placeholder="Başlık" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,fontSize:15}}/>
        <TextInput value={recContent} onChangeText={setRecContent} placeholder="İçerik..." multiline placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:120,textAlignVertical:"top",fontSize:14}}/>
        <TouchableOpacity onPress={sendRec} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:TC.color}}>
          <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>📤 Gönder</Text>
        </TouchableOpacity>
      </>)}
    </ScrollView>
  </ScreenContainer>);
}
