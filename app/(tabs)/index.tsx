import {ScrollView,Text,View,TouchableOpacity} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useColors} from "@/hooks/use-colors";
import {useRouter} from "expo-router";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const SESSION_KEY="session_v3";const APPTS_KEY="appointments_v2";
export default function HomeScreen(){
  const router=useRouter();const colors=useColors();
  const [user,setUser]=useState<any>(null);const [todayAppts,setTodayAppts]=useState<any[]>([]);
  useEffect(()=>{loadData();},[]);
  const loadData=async()=>{
    const s=await AsyncStorage.getItem(SESSION_KEY);if(s)setUser(JSON.parse(s));
    const a=await AsyncStorage.getItem(APPTS_KEY);if(a){const all=JSON.parse(a);const today=new Date().toISOString().split("T")[0];setTodayAppts(all.filter((x:any)=>x.date===today));}
  };
  const isDietitian=user?.role==="dietitian";
  const QUICK=isDietitian?[
    {icon:"📅",label:"Randevular",route:"/calendar-appointments",color:"#22c55e"},
    {icon:"💬",label:"Mesajlar",route:"/messaging",color:"#f97316"},
    {icon:"📝",label:"Not Al",route:"/dietitian-notes",color:"#8b5cf6"},
    {icon:"💡",label:"Öneriler",route:"/dietitian-recommendations",color:"#f59e0b"},
  ]:[
    {icon:"🥗",label:"Öğün Ekle",route:"/(tabs)/meals",color:"#22c55e"},
    {icon:"💧",label:"Su Takibi",route:"/features/health",color:"#3b82f6"},
    {icon:"💬",label:"Mesajlar",route:"/messaging",color:"#f97316"},
    {icon:"🎯",label:"Hedefler",route:"/advanced-analytics",color:"#ef4444"},
  ];
  return(<ScreenContainer>
    <ScrollView contentContainerStyle={{padding:16,gap:16,paddingBottom:32}}>
      <Text style={{fontSize:22,fontWeight:"bold",color:colors.foreground}}>
        {isDietitian?"👨‍⚕️":"👤"} Merhaba{user?.name?`, ${user.name.split(" ")[0]}`:""}!
      </Text>
      {isDietitian&&(
        <TouchableOpacity onPress={()=>router.push("/(tabs)/dietitian-dashboard")}
          style={{backgroundColor:colors.primary,borderRadius:14,padding:16,flexDirection:"row",alignItems:"center",gap:12}}>
          <Text style={{fontSize:32}}>👥</Text>
          <View style={{flex:1}}>
            <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>Danışanlarım</Text>
            <Text style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>Danışan listesi, sağlık verileri ve notlar</Text>
          </View>
          <Text style={{color:"#fff",fontSize:20}}>→</Text>
        </TouchableOpacity>
      )}
      {isDietitian&&todayAppts.length>0&&(
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
          <Text style={{fontWeight:"700",color:colors.foreground}}>📅 Bugünkü Randevular ({todayAppts.length})</Text>
          {todayAppts.map((a:any)=>(
            <View key={a.id} style={{flexDirection:"row",justifyContent:"space-between",paddingVertical:4}}>
              <Text style={{color:colors.foreground}}>👤 {a.clientName}</Text>
              <Text style={{color:colors.primary,fontWeight:"600"}}>🕐 {a.startTime}-{a.endTime}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>⚡ Hızlı Erişim</Text>
      <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
        {QUICK.map(q=>(
          <TouchableOpacity key={q.route} onPress={()=>router.push(q.route as any)}
            style={{width:"47%",backgroundColor:q.color+"15",borderRadius:12,padding:14,borderWidth:1,borderColor:q.color+"40",gap:6}}>
            <Text style={{fontSize:28}}>{q.icon}</Text>
            <Text style={{fontWeight:"700",color:q.color,fontSize:13}}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={()=>router.push("/features-menu")}
        style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,flexDirection:"row",justifyContent:"center",gap:8}}>
        <Text style={{fontSize:18}}>🔲</Text>
        <Text style={{color:colors.foreground,fontWeight:"700",fontSize:15}}>Tüm Özellikler</Text>
      </TouchableOpacity>
    </ScrollView>
  </ScreenContainer>);
}
