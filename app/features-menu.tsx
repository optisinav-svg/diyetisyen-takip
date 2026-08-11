import {ScrollView,Text,View,TouchableOpacity,Dimensions} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useRouter} from "expo-router";
import {useColors} from "@/hooks/use-colors";
const {width}=Dimensions.get("window");
const CW=(width-48)/2;
const FEATURES=[
  {id:"meals",title:"Beslenme Takibi",icon:"🥗",route:"/(tabs)/meals",color:"#E5F3FF",border:"#339AF0",text:"#1971C2"},
  {id:"health",title:"Sağlık Verileri",icon:"📈",route:"/features/health",color:"#E5FFE5",border:"#51CF66",text:"#2B8A3E"},
  {id:"food",title:"Mutfak Gıdaları",icon:"🍽️",route:"/food-management-categorized",color:"#FFF5E5",border:"#FFA94D",text:"#E67700"},
  {id:"analytics",title:"Analitik",icon:"📊",route:"/advanced-analytics",color:"#F3E5FF",border:"#B197FC",text:"#7950F2"},
  {id:"calendar",title:"Randevu Sistemi",icon:"📅",route:"/calendar-appointments",color:"#E5F9FF",border:"#74C0FC",text:"#0C7792"},
  {id:"messaging",title:"Mesajlaşma",icon:"💬",route:"/messaging",color:"#FFE5F5",border:"#F06595",text:"#C2255C"},
  {id:"dashboard",title:"Danışanlarım",icon:"👥",route:"/(tabs)/dietitian-dashboard",color:"#E5FFE5",border:"#51CF66",text:"#2B8A3E"},
  {id:"meal-plans",title:"Öğün Planları",icon:"📋",route:"/meal-plan-templates",color:"#E5F0FF",border:"#A5D8FF",text:"#1864AB"},
  {id:"micro",title:"Mikro Besin",icon:"🔬",route:"/micronutrient-tracking",color:"#FFE5F0",border:"#FF8787",text:"#D6336C"},
  {id:"rapor",title:"Rapor",icon:"📄",route:"/rapor",color:"#F5E5FF",border:"#DA77F2",text:"#9C36B5"},
  {id:"video",title:"Video Danışma",icon:"📹",route:"/video-consultation",color:"#E5F3FF",border:"#339AF0",text:"#1971C2"},
  {id:"recommendations",title:"Diyetisyen Önerileri",icon:"💡",route:"/dietitian-recommendations",color:"#FFF9E5",border:"#FFD43B",text:"#B8860B"},
  {id:"notifications",title:"Bildirimler",icon:"🔔",route:"/(tabs)/notifications",color:"#FFF5E5",border:"#FFA94D",text:"#E67700"},
  {id:"payment",title:"Ödeme & Abonelik",icon:"💳",route:"/payment-subscription",color:"#FFE5F0",border:"#FF8787",text:"#D6336C"},
  {id:"wearable",title:"Akıllı Saat",icon:"⌚",route:"/wearable-sync",color:"#E5FFF5",border:"#63E6BE",text:"#0B7285"},
  {id:"activity",title:"Aktivite Akışı",icon:"📢",route:"/activity-feed",color:"#E5FFE5",border:"#51CF66",text:"#2B8A3E"},
  {id:"notes",title:"Danışma Notları",icon:"📝",route:"/dietitian-notes",color:"#FFF9E5",border:"#FFD43B",text:"#B8860B"},
  {id:"achievements",title:"Rozetler",icon:"🏆",route:"/achievements-social",color:"#FFF9E0",border:"#FFD700",text:"#B8860B"},
];
export default function FeaturesMenuScreen(){
  const router=useRouter();const colors=useColors();
  return(<ScreenContainer>
    <ScrollView contentContainerStyle={{padding:16,paddingBottom:32}}>
      <Text style={{fontSize:24,fontWeight:"bold",color:colors.foreground,marginBottom:16}}>🥗 Diyetisyen Takip</Text>
      <View style={{flexDirection:"row",flexWrap:"wrap",gap:12}}>
        {FEATURES.map(f=>(
          <TouchableOpacity key={f.id} onPress={()=>router.push(f.route as any)}
            style={{width:CW,backgroundColor:f.color,borderRadius:14,padding:16,borderWidth:2,borderColor:f.border,gap:8}}>
            <Text style={{fontSize:28}}>{f.icon}</Text>
            <Text style={{fontSize:14,fontWeight:"700",color:f.text,lineHeight:18}}>{f.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </ScreenContainer>);
}
