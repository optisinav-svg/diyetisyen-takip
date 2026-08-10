import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const SESSIONS_KEY="video_sessions_v2";

interface Session{id:string;type:"individual"|"seminar";title:string;clientId?:string;clientName?:string;date:string;time:string;duration:number;platform:"zoom"|"meet"|"teams";link?:string;notes:string;status:"planned"|"completed"|"cancelled";}

export default function VideoConsultationScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [sessions,setSessions]=useState<Session[]>([]);
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [tab,setTab]=useState<"upcoming"|"create"|"seminars">("upcoming");
  const [showCreate,setShowCreate]=useState(false);
  const [sType,setSType]=useState<"individual"|"seminar">("individual");
  const [sTitle,setSTitle]=useState("");
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [sDate,setSDate]=useState("");const [sTime,setSTime]=useState("10:00");const [sDur,setSDur]=useState("60");
  const [sPlatform,setSPlatform]=useState<"zoom"|"meet"|"teams">("zoom");
  const [sLink,setSLink]=useState("");const [sNotes,setSNotes]=useState("");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const saved=await AsyncStorage.getItem(SESSIONS_KEY);
    if(saved)setSessions(JSON.parse(saved));
    else{
      const demo:Session[]=[
        {id:"1",type:"individual",title:"Haftalık Kontrol",clientId:"c1",clientName:"Ayşe Yılmaz",date:"2026-08-15",time:"10:00",duration:30,platform:"zoom",link:"https://zoom.us/j/123456789",notes:"",status:"planned"},
        {id:"2",type:"seminar",title:"Beslenme Bilinci Semineri",date:"2026-08-20",time:"14:00",duration:90,platform:"meet",link:"https://meet.google.com/abc-defg-hij",notes:"10 katılımcı bekleniyor",status:"planned"},
      ];
      setSessions(demo);await AsyncStorage.setItem(SESSIONS_KEY,JSON.stringify(demo));
    }
  };
  const save=async(list:Session[])=>{setSessions(list);await AsyncStorage.setItem(SESSIONS_KEY,JSON.stringify(list));};

  const createSession=async()=>{
    if(!sDate.trim()||!sTitle.trim()){Alert.alert("Hata","Başlık ve tarih girin");return;}
    if(sType==="individual"&&!selClient){Alert.alert("Hata","Danışan seçin");return;}
    const s:Session={id:Date.now().toString(),type:sType,title:sTitle,clientId:sType==="individual"?selClient?.id:undefined,clientName:sType==="individual"?selClient?.name:undefined,date:sDate,time:sTime,duration:Number(sDur),platform:sPlatform,link:sLink||undefined,notes:sNotes,status:"planned"};
    await save([...sessions,s]);
    setSTitle("");setSDate("");setSLink("");setSNotes("");setShowCreate(false);
    Alert.alert("✅ Oluşturuldu",`"${s.title}" planlandı.${sLink?`\nLink: ${sLink}`:"\n⚠️ Link eklemeyi unutmayın!"}`);
  };

  const upcoming=sessions.filter(s=>s.status==="planned").sort((a,b)=>a.date.localeCompare(b.date));
  const seminars=sessions.filter(s=>s.type==="seminar");
  const myUpcoming=sessions.filter(s=>s.status==="planned"&&(role==="dietitian"||s.clientId==="me"));

  const PC={"zoom":{name:"Zoom",icon:"📹",color:"#2D8CFF"},"meet":{name:"Google Meet",icon:"🎥",color:"#00897B"},"teams":{name:"Teams",icon:"💻",color:"#6264A7"}};

  const SessionCard=({s}:{s:Session})=>{
    const p=PC[s.platform];
    return(<View style={{backgroundColor:colors.surface,borderRadius:14,padding:16,gap:10,borderWidth:1,borderColor:s.status==="planned"?colors.primary:colors.border}}>
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start"}}>
        <View style={{flex:1}}>
          <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:4}}>
            <Text style={{fontSize:11,fontWeight:"700",paddingHorizontal:8,paddingVertical:2,borderRadius:6,backgroundColor:s.type==="seminar"?"#8b5cf620":"#22c55e20",color:s.type==="seminar"?"#8b5cf6":"#22c55e"}}>{s.type==="seminar"?"🎓 SEMİNER":"👤 BİREYSEL"}</Text>
          </View>
          <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{s.title}</Text>
          {s.clientName&&<Text style={{color:colors.muted,fontSize:13}}>👤 {s.clientName}</Text>}
        </View>
        <View style={{backgroundColor:p.color+"20",paddingHorizontal:10,paddingVertical:4,borderRadius:8}}>
          <Text style={{color:p.color,fontWeight:"700",fontSize:12}}>{p.icon} {p.name}</Text>
        </View>
      </View>
      <View style={{flexDirection:"row",gap:12}}>
        <Text style={{color:colors.muted,fontSize:13}}>📅 {s.date}</Text>
        <Text style={{color:colors.muted,fontSize:13}}>🕐 {s.time}</Text>
        <Text style={{color:colors.muted,fontSize:13}}>⏱ {s.duration} dk</Text>
      </View>
      {s.notes?<Text style={{color:colors.muted,fontSize:12,fontStyle:"italic"}}>{s.notes}</Text>:null}
      <View style={{flexDirection:"row",gap:8}}>
        {s.link?<TouchableOpacity onPress={()=>Alert.alert(`${p.name} Linki`,`${s.link}\n\nLinki kopyalayıp ${p.name}'e yapıştırın.`)}
          style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:p.color,flexDirection:"row",justifyContent:"center",gap:6}}>
          <Text style={{color:"#fff",fontWeight:"700"}}>{p.icon} Linke Git</Text>
        </TouchableOpacity>:<TouchableOpacity onPress={()=>Alert.alert("Link Yok","Bu görüşme için link eklenmemiş. Diyetisyeninizle iletişime geçin.")}
          style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:"#f97316",flexDirection:"row",justifyContent:"center",gap:6}}>
          <Text style={{color:"#fff",fontWeight:"700"}}>⚠️ Link Bekleniyor</Text>
        </TouchableOpacity>}
        {role==="dietitian"&&<TouchableOpacity onPress={()=>Alert.alert("İptal","Bu görüşmeyi iptal etmek istiyor musunuz?",[{text:"Hayır",style:"cancel"},{text:"İptal Et",style:"destructive",onPress:()=>save(sessions.map(x=>x.id===s.id?{...x,status:"cancelled" as const}:x))}])}
          style={{paddingVertical:10,paddingHorizontal:14,borderRadius:10,alignItems:"center",backgroundColor:"#ef444420",borderWidth:1,borderColor:"#ef4444"}}>
          <Text style={{color:"#ef4444",fontWeight:"700"}}>İptal</Text>
        </TouchableOpacity>}
      </View>
    </View>);
  };

  return(<ScreenContainer>
    <BackButton title="📹 Video Danışma"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      <View style={{backgroundColor:"#f97316"+"20",borderRadius:10,padding:12,borderWidth:1,borderColor:"#f97316"}}>
        <Text style={{color:"#f97316",fontSize:13,fontWeight:"600"}}>⚠️ Video görüşme için Zoom, Google Meet veya Teams linki gereklidir. Uygulama içi video çalışmaz.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"upcoming",l:"📅 Yaklaşan"},{k:"seminars",l:"🎓 Seminerler"},{k:"create",l:"➕ Planla"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
              style={{paddingHorizontal:16,paddingVertical:10,borderRadius:20,backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
              <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {tab==="upcoming"&&(<>
        {(role==="dietitian"?upcoming:myUpcoming).length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Yaklaşan görüşme yok.</Text>
          :(role==="dietitian"?upcoming:myUpcoming).map(s=><SessionCard key={s.id} s={s}/>)}
      </>)}

      {tab==="seminars"&&(<>
        {role==="dietitian"&&<TouchableOpacity onPress={()=>{setSType("seminar");setTab("create");}}
          style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700"}}>+ Seminer Planla</Text>
        </TouchableOpacity>}
        {seminars.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>Henüz seminer yok.</Text>:seminars.map(s=><SessionCard key={s.id} s={s}/>)}
      </>)}

      {tab==="create"&&role==="dietitian"&&(<>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"individual",l:"👤 Bireysel"},{k:"seminar",l:"🎓 Seminer"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setSType(t.k as any)}
              style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:sType===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:sType===t.k?colors.primary:colors.border}}>
              <Text style={{color:sType===t.k?"#fff":colors.foreground,fontWeight:"700"}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={sTitle} onChangeText={setSTitle} placeholder="Görüşme başlığı" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
        {sType==="individual"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
              <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>}
        <View style={{flexDirection:"row",gap:10}}>
          <View style={{flex:1,gap:4}}><Text style={{fontWeight:"600",color:colors.foreground}}>📅 Tarih</Text>
            <TextInput value={sDate} onChangeText={setSDate} placeholder="2026-08-15" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          </View>
          <View style={{flex:1,gap:4}}><Text style={{fontWeight:"600",color:colors.foreground}}>🕐 Saat</Text>
            <TextInput value={sTime} onChangeText={setSTime} placeholder="10:00" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          </View>
          <View style={{flex:1,gap:4}}><Text style={{fontWeight:"600",color:colors.foreground}}>⏱ Süre (dk)</Text>
            <TextInput value={sDur} onChangeText={setSDur} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          </View>
        </View>
        <View style={{flexDirection:"row",gap:8}}>
          {(["zoom","meet","teams"] as const).map(p=>(
            <TouchableOpacity key={p} onPress={()=>setSPlatform(p)}
              style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:sPlatform===p?PC[p].color+"30":colors.surface,borderWidth:2,borderColor:sPlatform===p?PC[p].color:colors.border}}>
              <Text style={{fontWeight:"700",fontSize:13,color:sPlatform===p?PC[p].color:colors.foreground}}>{PC[p].icon} {PC[p].name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={sLink} onChangeText={setSLink} placeholder="Video linki (zoom.us/j/...)" placeholderTextColor={colors.muted} autoCapitalize="none"
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
        <TextInput value={sNotes} onChangeText={setSNotes} placeholder="Notlar..." multiline placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:60}}/>
        <TouchableOpacity onPress={createSession} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>✅ Görüşme Planla</Text>
        </TouchableOpacity>
      </>)}
    </ScrollView>
  </ScreenContainer>);
}
