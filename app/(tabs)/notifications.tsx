import {ScrollView,Text,View,Switch,TouchableOpacity,Alert,TextInput,Modal} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useState,useEffect} from "react";
import {useColors} from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";

const NOTIF_KEY="notif_prefs_v2";
const BADGES_KEY="badges_v2";
const CUSTOM_REM_KEY="custom_reminders_v2";

interface Badge{id:string;clientId:string;clientName:string;icon:string;title:string;reason:string;active:boolean;earnedAt?:string;}
interface CustomRem{id:string;title:string;time:string;days:string[];active:boolean;}

const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const DEF_BADGES:Badge[]=[
  {id:"1",clientId:"c1",clientName:"Ayşe Yılmaz",icon:"💧",title:"Su Şampiyonu",reason:"7 gün boyunca günlük su hedefini tamamladı",active:false},
  {id:"2",clientId:"c2",clientName:"Mehmet Demir",icon:"👟",title:"Adım Ustası",reason:"10.000 adım hedefini 5 gün üst üste tuttu",active:false},
  {id:"3",clientId:"c1",clientName:"Ayşe Yılmaz",icon:"🥗",title:"Beslenme Yıldızı",reason:"Tüm öğünleri plana göre tüketti",active:false},
  {id:"4",clientId:"c3",clientName:"Fatma Kaya",icon:"😴",title:"Uyku Kalitesi",reason:"7 gece 7+ saat uyudu",active:false},
  {id:"5",clientId:"c2",clientName:"Mehmet Demir",icon:"🔥",title:"Kalori Dengesi",reason:"Haftalık kalori hedefini tutturdu",active:false},
];
const CLIENT_ACTIVITIES:Record<string,any>={
  "c1":{name:"Ayşe Yılmaz",water:1800,steps:8500,meals:3,sleep:7.5,calories:1850},
  "c2":{name:"Mehmet Demir",water:1200,steps:11000,meals:2,sleep:6.5,calories:2100},
  "c3":{name:"Fatma Kaya",water:2000,steps:6000,meals:3,sleep:8.0,calories:1750},
};

export default function NotificationsScreen(){
  const colors=useColors();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [tab,setTab]=useState<"reminders"|"badges"|"security">("reminders");
  const [prefs,setPrefs]=useState({mealReminder:true,mealTime:"08:00",appointmentReminder:true,appointmentBefore:"1 gün",goalAlert:true,goalAlertTime:"20:00",messages:true,weeklyReport:true});
  const [badges,setBadges]=useState<Badge[]>(DEF_BADGES);
  const [customRems,setCustomRems]=useState<CustomRem[]>([]);
  const [selClient,setSelClient]=useState("c1");
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [showAddRem,setShowAddRem]=useState(false);
  const [remTitle,setRemTitle]=useState("");const [remTime,setRemTime]=useState("09:00");const [remDays,setRemDays]=useState<string[]>(["Pzt","Sal","Çar","Per","Cum"]);
  const [twoFaEnabled,setTwoFaEnabled]=useState(false);const [twoFaMethod,setTwoFaMethod]=useState<"totp"|"sms">("totp");const [twoFaCode,setTwoFaCode]=useState("");const [twoFaStep,setTwoFaStep]=useState<"info"|"setup"|"verify">("info");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const b=await AsyncStorage.getItem(BADGES_KEY);if(b)setBadges(JSON.parse(b));
    const r=await AsyncStorage.getItem(CUSTOM_REM_KEY);if(r)setCustomRems(JSON.parse(r));
    const c=await getMyClients();setClients(c);
    const p=await AsyncStorage.getItem(NOTIF_KEY);if(p)setPrefs(JSON.parse(p));
  };
  const savePrefs=async(p:typeof prefs)=>{setPrefs(p);await AsyncStorage.setItem(NOTIF_KEY,JSON.stringify(p));};
  const toggleBadge=async(id:string)=>{
    const up=badges.map(b=>b.id===id?{...b,active:!b.active,earnedAt:!b.active?new Date().toISOString():undefined}:b);
    setBadges(up);await AsyncStorage.setItem(BADGES_KEY,JSON.stringify(up));
    const b=badges.find(x=>x.id===id);if(b&&!b.active)Alert.alert("🎉 Rozet Verildi!",`${b.clientName} "${b.title}" rozetini kazandı!`);
  };
  const addRem=async()=>{
    if(!remTitle.trim()){Alert.alert("Hata","Başlık girin");return;}
    const r:CustomRem={id:Date.now().toString(),title:remTitle,time:remTime,days:remDays,active:true};
    const up=[...customRems,r];setCustomRems(up);await AsyncStorage.setItem(CUSTOM_REM_KEY,JSON.stringify(up));
    setShowAddRem(false);setRemTitle("");setRemTime("09:00");Alert.alert("Eklendi ✅");
  };
  const delRem=async(id:string)=>{const up=customRems.filter(r=>r.id!==id);setCustomRems(up);await AsyncStorage.setItem(CUSTOM_REM_KEY,JSON.stringify(up));};
  const clientBadges=badges.filter(b=>b.clientId===selClient);
  const act=CLIENT_ACTIVITIES[selClient];
  const SW=({label,value,onChange,sub}:any)=>(
    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:10}}>
      <View style={{flex:1}}><Text style={{color:colors.foreground,fontSize:14}}>{label}</Text>{sub&&<Text style={{color:colors.muted,fontSize:11,marginTop:2}}>{sub}</Text>}</View>
      <Switch value={value} onValueChange={onChange} trackColor={{false:colors.border,true:colors.primary}}/>
    </View>
  );
  return(<ScreenContainer>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:32}}>
      <Text style={{fontSize:22,fontWeight:"bold",color:colors.foreground}}>🔔 Bildirimler</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"reminders",l:"⏰ Hatırlatıcı"},{k:"badges",l:"🏆 Rozetler"},{k:"security",l:"🔐 2FA"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
              style={{paddingHorizontal:16,paddingVertical:10,borderRadius:20,backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
              <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {tab==="reminders"&&(<>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:4}}>
          <Text style={{fontWeight:"700",color:colors.foreground,marginBottom:6}}>🍽️ Öğün Hatırlatması</Text>
          <SW label="Öğün Hatırlatmaları" value={prefs.mealReminder} onChange={(v:boolean)=>savePrefs({...prefs,mealReminder:v})} sub="Öğün saatlerinde hatırlatma gönderir"/>
          {prefs.mealReminder&&<View style={{flexDirection:"row",alignItems:"center",gap:8,marginTop:4}}>
            <Text style={{color:colors.muted,fontSize:13}}>Sabah saati:</Text>
            <TextInput value={prefs.mealTime} onChangeText={v=>savePrefs({...prefs,mealTime:v})} placeholder="08:00" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:8,color:colors.foreground,backgroundColor:colors.background,width:80}}/>
          </View>}
        </View>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:4}}>
          <Text style={{fontWeight:"700",color:colors.foreground,marginBottom:6}}>📅 Randevu Hatırlatması</Text>
          <SW label="Randevu Bildirimleri" value={prefs.appointmentReminder} onChange={(v:boolean)=>savePrefs({...prefs,appointmentReminder:v})} sub="Randevu öncesinde hatırlatma gönderir"/>
          {prefs.appointmentReminder&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8,marginTop:4}}>
              {["10 dakika","30 dakika","1 saat","1 gün","2 gün"].map(o=>(
                <TouchableOpacity key={o} onPress={()=>savePrefs({...prefs,appointmentBefore:o})}
                  style={{paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:prefs.appointmentBefore===o?colors.primary:colors.surface,borderWidth:1,borderColor:prefs.appointmentBefore===o?colors.primary:colors.border}}>
                  <Text style={{color:prefs.appointmentBefore===o?"#fff":colors.foreground,fontSize:12,fontWeight:"600"}}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>}
        </View>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:4}}>
          <Text style={{fontWeight:"700",color:colors.foreground,marginBottom:6}}>🎯 Hedef Uyarıları</Text>
          <SW label="Hedef Tamamlanmadıysa Uyar" value={prefs.goalAlert} onChange={(v:boolean)=>savePrefs({...prefs,goalAlert:v})} sub="Günlük hedefler tamamlanmadıysa akşam bildirir"/>
          {prefs.goalAlert&&<View style={{flexDirection:"row",alignItems:"center",gap:8,marginTop:4}}>
            <Text style={{color:colors.muted,fontSize:13}}>Uyarı saati:</Text>
            <TextInput value={prefs.goalAlertTime} onChangeText={v=>savePrefs({...prefs,goalAlertTime:v})} placeholder="20:00" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:8,color:colors.foreground,backgroundColor:colors.background,width:80}}/>
          </View>}
        </View>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border}}>
          <Text style={{fontWeight:"700",color:colors.foreground,marginBottom:6}}>📱 Diğer Bildirimler</Text>
          <SW label="💬 Mesaj Bildirimleri" value={prefs.messages} onChange={(v:boolean)=>savePrefs({...prefs,messages:v})}/>
          <SW label="📊 Haftalık Rapor" value={prefs.weeklyReport} onChange={(v:boolean)=>savePrefs({...prefs,weeklyReport:v})}/>
        </View>
        <View style={{gap:8}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>⏰ Özel Hatırlatıcılar</Text>
            <TouchableOpacity onPress={()=>setShowAddRem(true)} style={{paddingHorizontal:12,paddingVertical:6,borderRadius:8,backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"600",fontSize:13}}>+ Ekle</Text>
            </TouchableOpacity>
          </View>
          {customRems.length===0?<Text style={{color:colors.muted,fontSize:13}}>Henüz özel hatırlatıcı yok.</Text>
            :customRems.map(r=>(
              <View key={r.id} style={{backgroundColor:colors.surface,borderRadius:10,padding:12,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center"}}>
                <View style={{flex:1}}>
                  <Text style={{fontWeight:"600",color:colors.foreground}}>{r.title}</Text>
                  <Text style={{color:colors.muted,fontSize:12}}>🕐 {r.time} · {r.days.join(", ")}</Text>
                </View>
                <TouchableOpacity onPress={()=>delRem(r.id)}><Text style={{color:"#ef4444",fontSize:13}}>Sil</Text></TouchableOpacity>
              </View>
            ))}
        </View>
      </>)}

      {tab==="badges"&&(<>
        {role==="dietitian"?(<>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8}}>
              {clients.map(c=>(
                <TouchableOpacity key={c.id} onPress={()=>setSelClient(c.id)}
                  style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient===c.id?colors.primary:colors.border}}>
                  <Text style={{color:selClient===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {act&&<View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>📊 {act.name} - Bugünkü Aktiviteler</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
              {[{icon:"💧",label:"Su",value:`${act.water} ml`,color:"#3b82f6"},{icon:"👟",label:"Adım",value:act.steps.toLocaleString(),color:"#22c55e"},{icon:"🍽️",label:"Öğün",value:`${act.meals}/3`,color:"#f97316"},{icon:"😴",label:"Uyku",value:`${act.sleep} saat`,color:"#8b5cf6"},{icon:"🔥",label:"Kalori",value:`${act.calories} kcal`,color:"#ef4444"}].map(i=>(
                <View key={i.label} style={{flex:1,minWidth:"45%",backgroundColor:i.color+"15",borderRadius:10,padding:10,borderWidth:1,borderColor:i.color+"40"}}>
                  <Text>{i.icon} {i.label}</Text><Text style={{fontWeight:"700",color:i.color}}>{i.value}</Text>
                </View>
              ))}
            </View>
          </View>}
          <Text style={{fontWeight:"700",color:colors.foreground}}>🏆 Rozet Ver</Text>
          {clientBadges.map(b=>(
            <View key={b.id} style={{backgroundColor:b.active?"#FFD70020":colors.surface,borderRadius:12,padding:14,borderWidth:2,borderColor:b.active?"#FFD700":colors.border,flexDirection:"row",alignItems:"center",gap:12}}>
              <Text style={{fontSize:32}}>{b.icon}</Text>
              <View style={{flex:1}}>
                <Text style={{fontWeight:"700",color:colors.foreground}}>{b.title}</Text>
                <Text style={{color:colors.muted,fontSize:12}}>{b.reason}</Text>
                {b.active&&b.earnedAt&&<Text style={{color:"#FFD700",fontSize:11,marginTop:2}}>✅ {new Date(b.earnedAt).toLocaleDateString("tr-TR")}</Text>}
              </View>
              <Switch value={b.active} onValueChange={()=>toggleBadge(b.id)} trackColor={{false:colors.border,true:"#FFD700"}}/>
            </View>
          ))}
        </>):(
          badges.filter(b=>b.active).length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Henüz rozet kazanılmadı.</Text>
            :badges.filter(b=>b.active).map(b=>(
              <View key={b.id} style={{backgroundColor:"#FFD70020",borderRadius:12,padding:16,borderWidth:2,borderColor:"#FFD700",flexDirection:"row",alignItems:"center",gap:12}}>
                <Text style={{fontSize:36}}>{b.icon}</Text>
                <View><Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>{b.title}</Text><Text style={{color:colors.muted,fontSize:12}}>{b.reason}</Text></View>
              </View>
            ))
        )}
      </>)}

      {tab==="security"&&(<>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:twoFaEnabled?"#22c55e":colors.border}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <View><Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>🔐 İki Aşamalı Doğrulama</Text>
              <Text style={{color:colors.muted,fontSize:12,marginTop:2}}>{twoFaEnabled?"✅ Aktif — Hesabınız korunuyor":"Hesabınızı ekstra güvenlikle koruyun"}</Text>
            </View>
            <Switch value={twoFaEnabled} onValueChange={v=>{setTwoFaEnabled(v);setTwoFaStep(v?"setup":"info");}} trackColor={{false:colors.border,true:"#22c55e"}}/>
          </View>
        </View>
        {twoFaEnabled&&twoFaStep==="setup"&&(<>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:10}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>Doğrulama Yöntemi</Text>
            {[{k:"totp",l:"📱 Authenticator Uygulaması",d:"Google Authenticator, Authy vb."},{k:"sms",l:"📲 SMS",d:"Telefon numaranıza kod gönderilir"}].map(m=>(
              <TouchableOpacity key={m.k} onPress={()=>setTwoFaMethod(m.k as any)}
                style={{flexDirection:"row",alignItems:"center",gap:10,padding:12,borderRadius:10,backgroundColor:twoFaMethod===m.k?colors.primary+"20":colors.background,borderWidth:2,borderColor:twoFaMethod===m.k?colors.primary:colors.border}}>
                <View style={{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:twoFaMethod===m.k?colors.primary:colors.border,backgroundColor:twoFaMethod===m.k?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>
                  {twoFaMethod===m.k&&<View style={{width:8,height:8,borderRadius:4,backgroundColor:"#fff"}}/>}
                </View>
                <View><Text style={{fontWeight:"600",color:colors.foreground}}>{m.l}</Text><Text style={{color:colors.muted,fontSize:12}}>{m.d}</Text></View>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={()=>setTwoFaStep("verify")} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>Devam Et →</Text>
          </TouchableOpacity>
        </>)}
        {twoFaEnabled&&twoFaStep==="verify"&&(
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>{twoFaMethod==="totp"?"📱 Authenticator Kodu":"📲 SMS Kodu"}</Text>
            <TextInput value={twoFaCode} onChangeText={setTwoFaCode} placeholder="123456" keyboardType="numeric" maxLength={6} placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,color:colors.foreground,backgroundColor:colors.background,fontSize:24,textAlign:"center",letterSpacing:8}}/>
            <TouchableOpacity onPress={()=>{if(twoFaCode.length===6){setTwoFaStep("info");Alert.alert("✅ Aktif!","İki aşamalı doğrulama etkinleştirildi.");}else Alert.alert("Hata","6 haneli kod girin");}}
              style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:"#22c55e"}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>Doğrula ve Aktif Et</Text>
            </TouchableOpacity>
          </View>
        )}
        {!twoFaEnabled&&<View style={{backgroundColor:"#3b82f620",borderRadius:12,padding:14,borderWidth:1,borderColor:"#3b82f6"}}>
          <Text style={{color:"#3b82f6",fontSize:13,lineHeight:20}}>ℹ️ İki aşamalı doğrulama (2FA), hesabınıza sadece şifrenizle girilememesini sağlar. Giriş yaparken ek bir kod istenir.</Text>
        </View>}
      </>)}
    </ScrollView>

    <Modal visible={showAddRem} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14}}>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>⏰ Hatırlatıcı Ekle</Text>
          <TextInput value={remTitle} onChangeText={setRemTitle} placeholder="Hatırlatıcı başlığı" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <TextInput value={remTime} onChangeText={setRemTime} placeholder="09:00" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <View style={{flexDirection:"row",gap:8}}>
            {DAYS.map(d=>(
              <TouchableOpacity key={d} onPress={()=>setRemDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])}
                style={{flex:1,paddingVertical:8,borderRadius:8,alignItems:"center",backgroundColor:remDays.includes(d)?colors.primary:colors.surface,borderWidth:1,borderColor:remDays.includes(d)?colors.primary:colors.border}}>
                <Text style={{color:remDays.includes(d)?"#fff":colors.foreground,fontSize:11,fontWeight:"600"}}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setShowAddRem(false)} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.foreground}}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addRem} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </ScreenContainer>);
}
