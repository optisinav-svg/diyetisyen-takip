import {ScrollView,Text,View,TouchableOpacity} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ActivityFeedScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [filter,setFilter]=useState("Tümü");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);
  };

  const ACTIVITIES=[
    {id:"1",clientId:"c1",clientName:"Ayşe Yılmaz",type:"meal",icon:"🥗",text:"Öğle yemeği ekledi: Tavuk ızgara, bulgur pilavı",time:"14:32",category:"Beslenme",color:"#22c55e"},
    {id:"2",clientId:"c2",clientName:"Mehmet Demir",type:"steps",icon:"👟",text:"Günlük adım hedefini tamamladı: 10.234 adım",time:"13:15",category:"Aktivite",color:"#3b82f6"},
    {id:"3",clientId:"c1",clientName:"Ayşe Yılmaz",type:"water",icon:"💧",text:"Su hedefini tamamladı: 2.100 ml",time:"12:00",category:"Su",color:"#06b6d4"},
    {id:"4",clientId:"c3",clientName:"Fatma Kaya",type:"goal",icon:"🎯",text:"Protein hedefini aştı: 165g / 150g hedef",time:"11:45",category:"Hedef",color:"#8b5cf6"},
    {id:"5",clientId:"c2",clientName:"Mehmet Demir",type:"meal",icon:"🌅",text:"Kahvaltı ekledi: Yulaf ezmesi, meyve, süt",time:"08:20",category:"Beslenme",color:"#22c55e"},
    {id:"6",clientId:"c3",clientName:"Fatma Kaya",type:"weight",icon:"⚖️",text:"Kilo güncellemesi: 68.5 kg (→ -0.5 kg)",time:"07:00",category:"Ölçüm",color:"#f97316"},
    {id:"7",clientId:"c1",clientName:"Ayşe Yılmaz",type:"sleep",icon:"😴",text:"Uyku verisi: 7 saat 45 dakika",time:"Dün 23:30",category:"Uyku",color:"#6366f1"},
    {id:"8",clientId:"c2",clientName:"Mehmet Demir",type:"badge",icon:"🏆",text:"Yeni rozet kazandı: 💧 Su Şampiyonu",time:"Dün 20:00",category:"Rozet",color:"#f59e0b"},
    {id:"9",clientId:"c3",clientName:"Fatma Kaya",type:"meal",icon:"🌙",text:"Akşam yemeği ekledi: Mercimek çorbası, tam tahıllı ekmek",time:"Dün 19:30",category:"Beslenme",color:"#22c55e"},
    {id:"10",clientId:"c1",clientName:"Ayşe Yılmaz",type:"appointment",icon:"📅",text:"Randevu tamamlandı — Haftalık kontrol",time:"Dün 10:00",category:"Randevu",color:"#ef4444"},
  ];

  const CATS=["Tümü","Beslenme","Aktivite","Su","Hedef","Ölçüm","Uyku","Rozet","Randevu"];
  const filtered=ACTIVITIES.filter(a=>filter==="Tümü"||a.category===filter);

  return(<ScreenContainer>
    <BackButton title="📢 Aktivite Akışı"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      <Text style={{color:colors.muted,fontSize:13}}>Danışanlarınızın son aktiviteleri</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {CATS.map(c=>(<TouchableOpacity key={c} onPress={()=>setFilter(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:filter===c?colors.primary:colors.surface,borderWidth:1,borderColor:filter===c?colors.primary:colors.border}}>
            <Text style={{color:filter===c?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{c}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>

      {filtered.map((a,i)=>(
        <View key={a.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderLeftWidth:4,borderColor:colors.border,borderLeftColor:a.color,flexDirection:"row",gap:12,alignItems:"flex-start"}}>
          <View style={{width:44,height:44,borderRadius:22,backgroundColor:a.color+"20",alignItems:"center",justifyContent:"center"}}>
            <Text style={{fontSize:22}}>{a.icon}</Text>
          </View>
          <View style={{flex:1,gap:4}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontWeight:"700",color:colors.foreground,fontSize:13}}>👤 {a.clientName}</Text>
              <Text style={{color:colors.muted,fontSize:11}}>{a.time}</Text>
            </View>
            <Text style={{color:colors.foreground,fontSize:13,lineHeight:18}}>{a.text}</Text>
            <View style={{backgroundColor:a.color+"20",alignSelf:"flex-start",paddingHorizontal:8,paddingVertical:2,borderRadius:6}}>
              <Text style={{fontSize:11,fontWeight:"600",color:a.color}}>{a.category}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  </ScreenContainer>);
}
