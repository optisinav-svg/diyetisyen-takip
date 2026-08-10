import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal,FlatList} from "react-native";
import {useState,useEffect} from "react";
import {ScreenContainer} from "@/components/screen-container";
import {useColors} from "@/hooks/use-colors";
import {useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,saveMyClients,addClient,ClientRecord} from "@/lib/_core/clients-store";

const HEALTH_KEY="health_cards_v2";
const NOTES_KEY="client_notes_v2";
const UNMATCHED=[
  {id:"u1",name:"Zeynep Çelik",email:"zeynep@email.com",registeredAt:"2026-06-01"},
  {id:"u2",name:"Hasan Yıldız",email:"hasan@email.com",registeredAt:"2026-06-02"},
  {id:"u3",name:"Merve Kara",email:"merve@email.com",registeredAt:"2026-06-03"},
  {id:"u4",name:"Burak Şahin",email:"burak@email.com",registeredAt:"2026-06-04"},
];
const SC={good:{color:"#22c55e",label:"✅ İyi",bg:"#22c55e20"},warning:{color:"#f97316",label:"⚠️ Dikkat",bg:"#f9731620"},critical:{color:"#ef4444",label:"🔴 Kritik",bg:"#ef444420"}};
const HC=[{key:"diabetes",label:"Diyabet",icon:"🍬"},{key:"hypertension",label:"Hipertansiyon",icon:"🩸"},{key:"heartDisease",label:"Kalp Hastalığı",icon:"❤️"},{key:"obesity",label:"Obezite",icon:"⚖️"},{key:"kidneyDisease",label:"Böbrek Hastalığı",icon:"🫘"},{key:"thyroid",label:"Tiroid",icon:"🦋"}];
const HL=[{v:0,l:"Yok"},{v:1,l:"Hafif"},{v:2,l:"Orta"},{v:3,l:"Ağır"}];
const TREND_DATA={steps:[7200,8100,6500,9200,8700,10200,9800],calories:[1800,1950,1700,2100,1850,1900,2050],sleep:[6.5,7.0,7.5,6.0,7.5,8.0,7.0],water:[1500,1800,1600,2000,1750,1900,2100]};
const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const SAMPLE_MEALS=[
  {date:"Bugün",type:"Kahvaltı",foods:"Yulaf, meyve, süt",calories:320,ok:true},
  {date:"Bugün",type:"Öğle",foods:"Tavuk, pirinç, salata",calories:520,ok:true},
  {date:"Dün",type:"Kahvaltı",foods:"Ekmek, peynir",calories:280,ok:false},
  {date:"Dün",type:"Akşam",foods:"Balık, sebze",calories:450,ok:true},
];
type View2="clients"|"detail";
type Section="overview"|"health"|"trend"|"meals"|"notes"|"adherence";

export default function DietitianDashboard(){
  const colors=useColors();const router=useRouter();
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [healthCards,setHealthCards]=useState<Record<string,any>>({});
  const [clientNotes,setClientNotes]=useState<Record<string,any[]>>({});
  const [view,setView]=useState<View2>("clients");
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [section,setSection]=useState<Section>("overview");
  const [showAdd,setShowAdd]=useState(false);
  const [noteText,setNoteText]=useState("");
  const [selTrend,setSelTrend]=useState<"steps"|"calories"|"sleep"|"water">("steps");
  const [hcVals,setHcVals]=useState<any>({diabetes:0,hypertension:0,heartDisease:0,obesity:0,kidneyDisease:0,thyroid:0,notes:""});

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const c=await getMyClients();setClients(c);
    const hc=await AsyncStorage.getItem(HEALTH_KEY);if(hc)setHealthCards(JSON.parse(hc));
    const cn=await AsyncStorage.getItem(NOTES_KEY);if(cn)setClientNotes(JSON.parse(cn));
  };
  const addC=async(u:typeof UNMATCHED[0])=>{
    const nc:ClientRecord={id:u.id,name:u.name,email:u.email,addedAt:new Date().toISOString(),adherenceRate:Math.floor(Math.random()*30)+60,status:"good",lastSeen:"Bugün"};
    await addClient(nc);const c=await getMyClients();setClients(c);setShowAdd(false);
    Alert.alert("✅ Eklendi",`${u.name} takibinize alındı.`);
  };
  const saveHC=async()=>{
    if(!selClient)return;
    const up={...healthCards,[selClient.id]:{...hcVals,clientId:selClient.id,updatedAt:new Date().toISOString()}};
    setHealthCards(up);await AsyncStorage.setItem(HEALTH_KEY,JSON.stringify(up));
    Alert.alert("Kaydedildi ✅");
  };
  const addNote=async()=>{
    if(!noteText.trim()||!selClient)return;
    const note={id:Date.now().toString(),content:noteText,date:new Date().toISOString()};
    const up={...clientNotes,[selClient.id]:[note,...(clientNotes[selClient.id]??[])]};
    setClientNotes(up);await AsyncStorage.setItem(NOTES_KEY,JSON.stringify(up));
    setNoteText("");Alert.alert("Not kaydedildi ✅");
  };
  const available=UNMATCHED.filter(u=>!clients.find(c=>c.id===u.id));
  const trendVals=TREND_DATA[selTrend];const maxT=Math.max(...trendVals);
  const hc=selClient?healthCards[selClient.id]:null;
  const notes=selClient?clientNotes[selClient.id]??[]:[];

  if(view==="clients")return(
    <ScreenContainer>
      <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:32}}>
        <Text style={{fontSize:22,fontWeight:"bold",color:colors.foreground}}>👨‍⚕️ Danışanlarım</Text>
        <TouchableOpacity onPress={()=>setShowAdd(true)} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>+ Danışan Ekle</Text>
        </TouchableOpacity>
        {clients.length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Henüz danışan yok.</Text>
          :clients.map(c=>{const sc=SC[c.status];return(
            <TouchableOpacity key={c.id} onPress={()=>{setSelClient(c);setSection("overview");setHcVals(healthCards[c.id]??{diabetes:0,hypertension:0,heartDisease:0,obesity:0,kidneyDisease:0,thyroid:0,notes:""});setView("detail");}}
              style={{backgroundColor:colors.surface,borderRadius:14,padding:16,borderWidth:2,borderColor:sc.color,gap:8}}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start"}}>
                <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                  <View style={{width:44,height:44,borderRadius:22,backgroundColor:colors.primary+"30",alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:20}}>👤</Text></View>
                  <View><Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{c.name}</Text><Text style={{fontSize:12,color:colors.muted}}>{c.email}</Text></View>
                </View>
                <View style={{backgroundColor:sc.bg,paddingHorizontal:10,paddingVertical:4,borderRadius:8}}><Text style={{color:sc.color,fontWeight:"700",fontSize:12}}>{sc.label}</Text></View>
              </View>
              <View style={{flexDirection:"row",gap:12}}>
                <Text style={{color:colors.muted,fontSize:12}}>📊 Uyum: <Text style={{color:colors.primary,fontWeight:"700"}}>{c.adherenceRate}%</Text></Text>
                <Text style={{color:colors.muted,fontSize:12}}>🕐 {c.lastSeen}</Text>
              </View>
            </TouchableOpacity>
          );})}
      </ScrollView>
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
          <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:"70%"}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>Danışan Ekle</Text>
              <TouchableOpacity onPress={()=>setShowAdd(false)}><Text style={{color:"#ef4444",fontWeight:"600"}}>Kapat</Text></TouchableOpacity>
            </View>
            <Text style={{color:colors.muted,fontSize:13,marginBottom:12}}>Sisteme kayıtlı ve eşleşmemiş danışanlar:</Text>
            {available.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>Tüm danışanlar takibinizde.</Text>
              :<FlatList data={available} keyExtractor={i=>i.id} renderItem={({item})=>(
                <TouchableOpacity onPress={()=>addC(item)} style={{flexDirection:"row",alignItems:"center",gap:12,padding:14,borderRadius:12,marginBottom:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
                  <Text style={{fontSize:24}}>👤</Text>
                  <View style={{flex:1}}><Text style={{fontWeight:"700",color:colors.foreground}}>{item.name}</Text><Text style={{color:colors.muted,fontSize:12}}>{item.email}</Text></View>
                  <Text style={{color:colors.primary,fontWeight:"700"}}>Ekle →</Text>
                </TouchableOpacity>
              )}/>}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );

  if(view==="detail"&&selClient)return(
    <ScreenContainer>
      <View style={{paddingHorizontal:16,paddingTop:12,paddingBottom:8}}>
        <TouchableOpacity onPress={()=>setView("clients")} style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:10}}>
          <Text style={{color:colors.primary,fontSize:14,fontWeight:"600"}}>← Danışanlar</Text>
        </TouchableOpacity>
        <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
          <View style={{width:44,height:44,borderRadius:22,backgroundColor:colors.primary+"30",alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:22}}>👤</Text></View>
          <View style={{flex:1}}><Text style={{fontSize:18,fontWeight:"bold",color:colors.foreground}}>{selClient.name}</Text><Text style={{fontSize:12,color:colors.muted}}>{selClient.email}</Text></View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingHorizontal:12,marginBottom:4}}>
        <View style={{flexDirection:"row",gap:6,paddingBottom:8}}>
          {[{k:"overview",l:"📊 Özet"},{k:"health",l:"🩺 Sağlık"},{k:"trend",l:"📈 Trend"},{k:"meals",l:"🍽️ Öğünler"},{k:"notes",l:"📝 Notlar"},{k:"adherence",l:"🎯 Uyum"}].map(s=>(
            <TouchableOpacity key={s.k} onPress={()=>setSection(s.k as Section)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:section===s.k?colors.primary:colors.surface,borderWidth:1,borderColor:section===s.k?colors.primary:colors.border}}>
              <Text style={{color:section===s.k?"#fff":colors.foreground,fontWeight:"600",fontSize:12}}>{s.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:32}}>
        {section==="overview"&&(<>
          <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
            {[{icon:"📊",label:"Uyum",value:`${selClient.adherenceRate}%`,color:colors.primary},{icon:"👟",label:"Ort. Adım",value:"8.234",color:"#3b82f6"},{icon:"😴",label:"Ort. Uyku",value:"7.2 saat",color:"#8b5cf6"},{icon:"💧",label:"Ort. Su",value:"1.8 L",color:"#06b6d4"},{icon:"🔥",label:"Ort. Kalori",value:"1.850 kcal",color:"#f97316"},{icon:"❤️",label:"Ort. Kalp",value:"72 bpm",color:"#ef4444"}].map(item=>(
              <View key={item.label} style={{width:"47%",backgroundColor:colors.surface,borderRadius:10,padding:12,borderWidth:1,borderColor:colors.border,gap:4}}>
                <Text style={{fontSize:20}}>{item.icon}</Text>
                <Text style={{fontSize:16,fontWeight:"bold",color:item.color}}>{item.value}</Text>
                <Text style={{fontSize:11,color:colors.muted}}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>📈 Aktivite Artışı (Geçen Haftaya Göre)</Text>
            {[{icon:"👟",label:"Adım",change:+12},{icon:"💧",label:"Su",change:+8},{icon:"😴",label:"Uyku",change:-5},{icon:"🔥",label:"Kalori Yakımı",change:+15}].map(item=>(
              <View key={item.label} style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:4}}>
                <Text style={{color:colors.foreground}}>{item.icon} {item.label}</Text>
                <Text style={{fontWeight:"700",color:item.change>0?"#22c55e":"#ef4444"}}>{item.change>0?"↑":"↓"} {Math.abs(item.change)}%</Text>
              </View>
            ))}
          </View>
        </>)}
        {section==="health"&&(<>
          <Text style={{color:colors.muted,fontSize:13}}>Her hastalık için derecelendirme yapın (0=Yok, 3=Ağır)</Text>
          {HC.map(c=>(
            <View key={c.key} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:8}}>
              <Text style={{fontWeight:"700",color:colors.foreground}}>{c.icon} {c.label}</Text>
              <View style={{flexDirection:"row",gap:8}}>
                {HL.map(l=>(
                  <TouchableOpacity key={l.v} onPress={()=>setHcVals((p:any)=>({...p,[c.key]:l.v}))}
                    style={{flex:1,paddingVertical:8,borderRadius:8,alignItems:"center",backgroundColor:hcVals[c.key]===l.v?colors.primary:colors.background,borderWidth:1,borderColor:hcVals[c.key]===l.v?colors.primary:colors.border}}>
                    <Text style={{color:hcVals[c.key]===l.v?"#fff":colors.foreground,fontSize:11,fontWeight:"600"}}>{l.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TextInput value={hcVals.notes??""} onChangeText={v=>setHcVals((p:any)=>({...p,notes:v}))} placeholder="Ek notlar..." multiline placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:60}}/>
          <TouchableOpacity onPress={saveHC} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>💾 Kaydet</Text>
          </TouchableOpacity>
        </>)}
        {section==="trend"&&(<>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8}}>
              {(["steps","calories","sleep","water"] as const).map(t=>(
                <TouchableOpacity key={t} onPress={()=>setSelTrend(t)}
                  style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selTrend===t?colors.primary:colors.surface,borderWidth:1,borderColor:selTrend===t?colors.primary:colors.border}}>
                  <Text style={{color:selTrend===t?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{t==="steps"?"👟 Adım":t==="calories"?"🔥 Kalori":t==="sleep"?"😴 Uyku":"💧 Su"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border}}>
            <Text style={{fontWeight:"700",color:colors.foreground,marginBottom:12}}>Son 7 Gün</Text>
            <View style={{flexDirection:"row",alignItems:"flex-end",height:140,gap:8}}>
              {trendVals.map((val,i)=>(
                <View key={i} style={{flex:1,alignItems:"center",gap:4}}>
                  <Text style={{fontSize:9,color:colors.primary}}>{val>999?`${(val/1000).toFixed(1)}k`:val}</Text>
                  <View style={{width:"100%",borderRadius:4,backgroundColor:colors.primary,height:Math.max((val/maxT)*120,4)}}/>
                  <Text style={{fontSize:9,color:colors.muted}}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </>)}
        {section==="meals"&&(<>
          <Text style={{color:colors.muted,fontSize:13}}>Danışanın son öğünleri ve plana uyumu</Text>
          {SAMPLE_MEALS.map((m,i)=>(
            <View key={i} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,gap:4,borderWidth:1,borderColor:m.ok?"#22c55e":"#ef4444"}}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                <Text style={{fontWeight:"700",color:colors.foreground}}>{m.date} — {m.type}</Text>
                <Text style={{color:m.ok?"#22c55e":"#ef4444",fontWeight:"600",fontSize:12}}>{m.ok?"✅ Plana uydu":"❌ Plan dışı"}</Text>
              </View>
              <Text style={{color:colors.muted,fontSize:13}}>{m.foods}</Text>
              <Text style={{color:colors.primary,fontSize:12}}>🔥 {m.calories} kcal</Text>
            </View>
          ))}
        </>)}
        {section==="notes"&&(<>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:10}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>📝 Yeni Not</Text>
            <TextInput value={noteText} onChangeText={setNoteText} placeholder="Danışma notunu buraya yazın..." multiline placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background,minHeight:100,textAlignVertical:"top",fontSize:14}}/>
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity onPress={addNote} style={{flex:2,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.primary}}>
                <Text style={{color:"#fff",fontWeight:"700"}}>💾 Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>router.push("/calendar-appointments")} style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.primary}}>
                <Text style={{color:colors.primary,fontWeight:"700"}}>📅 Randevu</Text>
              </TouchableOpacity>
            </View>
          </View>
          {notes.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>Henüz not yok.</Text>
            :notes.map((n:any)=>(
              <View key={n.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,gap:6,borderWidth:1,borderColor:colors.border}}>
                <Text style={{fontSize:12,color:colors.muted}}>{new Date(n.date).toLocaleDateString("tr-TR")} {new Date(n.date).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</Text>
                <Text style={{color:colors.foreground,fontSize:14,lineHeight:22}}>{n.content}</Text>
              </View>
            ))}
        </>)}
        {section==="adherence"&&(<>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
            <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>🎯 Genel Uyum Oranı</Text>
            <Text style={{fontSize:48,fontWeight:"bold",color:colors.primary,textAlign:"center"}}>{selClient.adherenceRate}%</Text>
            <View style={{height:16,backgroundColor:colors.border,borderRadius:8}}>
              <View style={{height:16,borderRadius:8,backgroundColor:selClient.adherenceRate>=80?"#22c55e":selClient.adherenceRate>=60?"#f97316":"#ef4444",width:`${selClient.adherenceRate}%`}}/>
            </View>
          </View>
          {[{label:"Öğün Planı",rate:88,icon:"🍽️"},{label:"Su Tüketimi",rate:75,icon:"💧"},{label:"Aktivite",rate:65,icon:"👟"},{label:"Uyku",rate:80,icon:"😴"}].map(item=>(
            <View key={item.label} style={{backgroundColor:colors.surface,borderRadius:10,padding:14,borderWidth:1,borderColor:colors.border,gap:6}}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                <Text style={{color:colors.foreground}}>{item.icon} {item.label}</Text>
                <Text style={{color:item.rate>=80?"#22c55e":item.rate>=60?"#f97316":"#ef4444",fontWeight:"700"}}>{item.rate}%</Text>
              </View>
              <View style={{height:8,backgroundColor:colors.border,borderRadius:4}}>
                <View style={{height:8,borderRadius:4,backgroundColor:item.rate>=80?"#22c55e":item.rate>=60?"#f97316":"#ef4444",width:`${item.rate}%`}}/>
              </View>
            </View>
          ))}
        </>)}
      </ScrollView>
    </ScreenContainer>
  );
  return null;
}
