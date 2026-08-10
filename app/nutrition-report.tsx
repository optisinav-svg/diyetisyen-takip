import {ScrollView,Text,View,TouchableOpacity} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const MEALS_KEY="meals_v3";

export default function NutritionReportScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [period,setPeriod]=useState<"today"|"week"|"month">("week");
  const [meals,setMeals]=useState<any[]>([]);

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const m=await AsyncStorage.getItem(MEALS_KEY);if(m)setMeals(JSON.parse(m));
  };

  const today=new Date().toISOString().split("T")[0];
  const getDateRange=()=>{
    const now=new Date();
    if(period==="today")return[today,today];
    if(period==="week"){const w=new Date(now);w.setDate(now.getDate()-7);return[w.toISOString().split("T")[0],today];}
    const m=new Date(now);m.setDate(now.getDate()-30);return[m.toISOString().split("T")[0],today];
  };
  const [start,end]=getDateRange();
  const periodMeals=meals.filter(m=>m.date>=start&&m.date<=end);
  const totalCals=periodMeals.reduce((s:number,m:any)=>s+m.calories,0);
  const avgCals=periodMeals.length>0?Math.round(totalCals/(period==="today"?1:period==="week"?7:30)):0;

  // Simulated macro data
  const macros={protein:Math.round(avgCals*0.3/4),carbs:Math.round(avgCals*0.45/4),fat:Math.round(avgCals*0.25/9)};
  const mealTypeCounts={breakfast:periodMeals.filter((m:any)=>m.type==="breakfast").length,lunch:periodMeals.filter((m:any)=>m.type==="lunch").length,dinner:periodMeals.filter((m:any)=>m.type==="dinner").length,snack:periodMeals.filter((m:any)=>m.type==="snack").length};

  const Bar=({label,value,max,color,unit}:any)=>{const pct=max>0?Math.min((value/max)*100,100):0;return(
    <View style={{gap:4}}>
      <View style={{flexDirection:"row",justifyContent:"space-between"}}>
        <Text style={{color:colors.foreground,fontSize:13}}>{label}</Text>
        <Text style={{color:color,fontWeight:"700"}}>{value} {unit}</Text>
      </View>
      <View style={{height:10,backgroundColor:colors.border,borderRadius:5}}>
        <View style={{height:10,borderRadius:5,backgroundColor:color,width:`${pct}%`}}/>
      </View>
    </View>
  );};

  return(<ScreenContainer>
    <BackButton title="📊 Beslenme Raporu"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
            <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>}

      <View style={{flexDirection:"row",gap:8}}>
        {[{k:"today",l:"Bugün"},{k:"week",l:"7 Gün"},{k:"month",l:"30 Gün"}].map(p=>(
          <TouchableOpacity key={p.k} onPress={()=>setPeriod(p.k as any)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:period===p.k?colors.primary:colors.surface,borderWidth:1,borderColor:period===p.k?colors.primary:colors.border}}>
            <Text style={{color:period===p.k?"#fff":colors.foreground,fontWeight:"600"}}>{p.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Özet Kartlar */}
      <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
        {[{icon:"🔥",l:"Ort. Kalori",v:`${avgCals} kcal`,c:"#f97316"},{icon:"🍽️",l:"Öğün Sayısı",v:String(periodMeals.length),c:"#22c55e"},{icon:"🥩",l:"Ort. Protein",v:`${macros.protein}g`,c:"#ef4444"},{icon:"🍞",l:"Ort. Karb.",v:`${macros.carbs}g`,c:"#f59e0b"}].map(item=>(
          <View key={item.l} style={{width:"47%",backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:item.c+"40",gap:4}}>
            <Text style={{fontSize:22}}>{item.icon}</Text>
            <Text style={{fontSize:18,fontWeight:"bold",color:item.c}}>{item.v}</Text>
            <Text style={{fontSize:11,color:colors.muted}}>{item.l}</Text>
          </View>
        ))}
      </View>

      {/* Makro Dağılımı */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
        <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>🧬 Makro Dağılımı</Text>
        <Bar label="🥩 Protein" value={macros.protein} max={200} color="#ef4444" unit="g"/>
        <Bar label="🍞 Karbonhidrat" value={macros.carbs} max={300} color="#f59e0b" unit="g"/>
        <Bar label="🫒 Yağ" value={macros.fat} max={100} color="#8b5cf6" unit="g"/>
      </View>

      {/* Öğün Dağılımı */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
        <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>📋 Öğün Dağılımı</Text>
        {[{icon:"🌅",l:"Kahvaltı",v:mealTypeCounts.breakfast,c:"#f59e0b"},{icon:"☀️",l:"Öğle",v:mealTypeCounts.lunch,c:"#22c55e"},{icon:"🌙",l:"Akşam",v:mealTypeCounts.dinner,c:"#3b82f6"},{icon:"🍎",l:"Ara Öğün",v:mealTypeCounts.snack,c:"#f97316"}].map(item=>(
          <View key={item.l} style={{flexDirection:"row",alignItems:"center",gap:10}}>
            <Text style={{fontSize:20}}>{item.icon}</Text>
            <Text style={{flex:1,color:colors.foreground}}>{item.l}</Text>
            <Text style={{fontWeight:"700",color:item.c}}>{item.v} öğün</Text>
          </View>
        ))}
      </View>

      {/* Genel Değerlendirme */}
      <View style={{backgroundColor:"#22c55e20",borderRadius:12,padding:16,borderWidth:1,borderColor:"#22c55e",gap:8}}>
        <Text style={{fontWeight:"700",color:"#22c55e",fontSize:16}}>✅ Genel Değerlendirme</Text>
        {avgCals>0?(<>
          <Text style={{color:colors.foreground,fontSize:14,lineHeight:22}}>
            {period==="today"?"Bugünkü":"Dönem"} ortalama kalori alımınız <Text style={{fontWeight:"700",color:"#22c55e"}}>{avgCals} kcal</Text>.
            {avgCals<1500?" Bu değer oldukça düşük, daha fazla besin almanız önerilir."
              :avgCals<2200?" Bu değer sağlıklı aralıkta, devam edin!"
              :" Bu değer yüksek, porsiyonlarınızı kontrol edin."}
          </Text>
          <Text style={{color:colors.foreground,fontSize:14}}>Protein alımınız <Text style={{fontWeight:"700"}}>{macros.protein}g</Text> — {macros.protein>=100?"✅ Yeterli":"⚠️ Artırılabilir"}</Text>
        </>):<Text style={{color:colors.muted}}>Henüz yeterli veri yok. Öğün eklemeye başlayın.</Text>}
      </View>
    </ScrollView>
  </ScreenContainer>);
}
