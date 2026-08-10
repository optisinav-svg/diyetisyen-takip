import {ScrollView,Text,View,TouchableOpacity} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

export default function WeeklyReportsScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [selWeek,setSelWeek]=useState(0);// 0=bu hafta, -1=geçen hafta

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
  };

  // Simulated weekly data
  const getWeekData=(weekOffset:number)=>{
    const base=weekOffset===0?[82,75,90,65,88,70,80]:[75,80,70,85,72,68,78];
    return{
      adherence:base,
      calories:[1850,1920,1780,2050,1900,1750,2100],
      water:[1800,2000,1600,2200,1900,1500,2100],
      steps:[7500,8200,6800,9100,8500,5500,10200],
      sleep:[7.0,6.5,7.5,8.0,7.0,8.5,7.5],
      avgAdherence:Math.round(base.reduce((a:number,b:number)=>a+b,0)/7),
    };
  };
  const data=getWeekData(selWeek);
  const maxVal=(arr:number[])=>Math.max(...arr);

  const BarChart=({values,color,unit,height=80}:{values:number[];color:string;unit:string;height?:number})=>{
    const max=maxVal(values);
    return(<View style={{flexDirection:"row",alignItems:"flex-end",height:height+20,gap:4}}>
      {values.map((v,i)=>(
        <View key={i} style={{flex:1,alignItems:"center",gap:2}}>
          <Text style={{fontSize:8,color:colors.primary}}>{v>999?`${(v/1000).toFixed(1)}k`:v}</Text>
          <View style={{width:"100%",borderRadius:3,backgroundColor:color,height:Math.max((v/max)*height,3)}}/>
          <Text style={{fontSize:9,color:colors.muted}}>{DAYS[i]}</Text>
        </View>
      ))}
    </View>);
  };

  const now=new Date();
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay()+1+(selWeek*7));
  const weekEnd=new Date(weekStart);weekEnd.setDate(weekStart.getDate()+6);
  const fmt=(d:Date)=>`${d.getDate()}.${d.getMonth()+1}`;

  return(<ScreenContainer>
    <BackButton title="📅 Haftalık Rapor"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
            <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>}

      {/* Hafta seçimi */}
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:colors.surface,borderRadius:12,padding:12,borderWidth:1,borderColor:colors.border}}>
        <TouchableOpacity onPress={()=>setSelWeek(w=>w-1)} style={{padding:8}}>
          <Text style={{color:colors.primary,fontSize:18,fontWeight:"700"}}>←</Text>
        </TouchableOpacity>
        <Text style={{fontWeight:"700",color:colors.foreground}}>{selWeek===0?"Bu Hafta":selWeek===-1?"Geçen Hafta":`${Math.abs(selWeek)} Hafta Önce`}{"\n"}<Text style={{fontSize:12,fontWeight:"400",color:colors.muted}}>{fmt(weekStart)} - {fmt(weekEnd)}</Text></Text>
        <TouchableOpacity onPress={()=>setSelWeek(w=>Math.min(w+1,0))} disabled={selWeek===0} style={{padding:8}}>
          <Text style={{color:selWeek===0?colors.muted:colors.primary,fontSize:18,fontWeight:"700"}}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Genel Uyum */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:2,borderColor:data.avgAdherence>=80?"#22c55e":"#f97316",gap:8}}>
        <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>🎯 Haftalık Uyum Oranı</Text>
        <Text style={{fontSize:48,fontWeight:"bold",color:data.avgAdherence>=80?"#22c55e":"#f97316",textAlign:"center"}}>{data.avgAdherence}%</Text>
        <View style={{height:12,backgroundColor:colors.border,borderRadius:6}}>
          <View style={{height:12,backgroundColor:data.avgAdherence>=80?"#22c55e":"#f97316",borderRadius:6,width:`${data.avgAdherence}%`}}/>
        </View>
        <Text style={{color:colors.muted,textAlign:"center",fontSize:13}}>
          {data.avgAdherence>=85?"🌟 Mükemmel hafta!":data.avgAdherence>=70?"👍 İyi bir hafta, devam edin!":"💪 Daha iyi yapabilirsiniz!"}
        </Text>
      </View>

      {/* Günlük Uyum Grafiği */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
        <Text style={{fontWeight:"700",color:colors.foreground}}>📊 Günlük Uyum (%)</Text>
        <BarChart values={data.adherence} color={colors.primary} unit="%"/>
      </View>

      {/* Kalori */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
        <Text style={{fontWeight:"700",color:colors.foreground}}>🔥 Günlük Kalori (kcal)</Text>
        <BarChart values={data.calories} color="#f97316" unit="kcal"/>
        <Text style={{color:colors.muted,fontSize:12,textAlign:"center"}}>Haftalık ort: {Math.round(data.calories.reduce((a,b)=>a+b,0)/7)} kcal</Text>
      </View>

      {/* Su */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
        <Text style={{fontWeight:"700",color:colors.foreground}}>💧 Su Tüketimi (ml)</Text>
        <BarChart values={data.water} color="#3b82f6" unit="ml"/>
        <Text style={{color:colors.muted,fontSize:12,textAlign:"center"}}>Haftalık ort: {Math.round(data.water.reduce((a,b)=>a+b,0)/7)} ml</Text>
      </View>

      {/* Adım */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
        <Text style={{fontWeight:"700",color:colors.foreground}}>👟 Günlük Adım</Text>
        <BarChart values={data.steps} color="#22c55e" unit="adım" height={100}/>
        <Text style={{color:colors.muted,fontSize:12,textAlign:"center"}}>Haftalık ort: {Math.round(data.steps.reduce((a,b)=>a+b,0)/7).toLocaleString("tr-TR")} adım</Text>
      </View>

      {/* Uyku */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
        <Text style={{fontWeight:"700",color:colors.foreground}}>😴 Uyku (saat)</Text>
        <BarChart values={data.sleep} color="#8b5cf6" unit="saat"/>
        <Text style={{color:colors.muted,fontSize:12,textAlign:"center"}}>Haftalık ort: {(data.sleep.reduce((a,b)=>a+b,0)/7).toFixed(1)} saat</Text>
      </View>

      {/* Özet */}
      <View style={{backgroundColor:"#22c55e20",borderRadius:12,padding:16,borderWidth:1,borderColor:"#22c55e",gap:8}}>
        <Text style={{fontWeight:"700",color:"#22c55e",fontSize:16}}>📋 Haftalık Özet</Text>
        {[{icon:"🎯",l:"Uyum",v:`${data.avgAdherence}%`,ok:data.avgAdherence>=75},{icon:"🔥",l:"Ort. Kalori",v:`${Math.round(data.calories.reduce((a,b)=>a+b,0)/7)} kcal`,ok:true},{icon:"💧",l:"Ort. Su",v:`${Math.round(data.water.reduce((a,b)=>a+b,0)/7)} ml`,ok:Math.round(data.water.reduce((a,b)=>a+b,0)/7)>=1800},{icon:"👟",l:"Ort. Adım",v:`${Math.round(data.steps.reduce((a,b)=>a+b,0)/7).toLocaleString("tr-TR")}`,ok:Math.round(data.steps.reduce((a,b)=>a+b,0)/7)>=8000},{icon:"😴",l:"Ort. Uyku",v:`${(data.sleep.reduce((a,b)=>a+b,0)/7).toFixed(1)} saat`,ok:(data.sleep.reduce((a,b)=>a+b,0)/7)>=7}].map(item=>(
          <View key={item.l} style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:4}}>
            <Text style={{color:colors.foreground}}>{item.icon} {item.l}</Text>
            <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
              <Text style={{fontWeight:"700",color:item.ok?"#22c55e":"#f97316"}}>{item.v}</Text>
              <Text>{item.ok?"✅":"⚠️"}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  </ScreenContainer>);
}
