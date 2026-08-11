import {ScrollView,Text,View,TouchableOpacity} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useRouter} from "expo-router";
export default function RaporScreen(){
  const router=useRouter();const colors=useColors();
  return(<ScreenContainer>
    <BackButton title="📄 Raporlar"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:32}}>
      <Text style={{color:colors.muted,fontSize:14}}>Görüntülemek istediğiniz raporu seçin</Text>
      {[{title:"📊 Beslenme Raporu",desc:"Kalori, protein, karbonhidrat ve yağ analizi",route:"/nutrition-report",color:"#E5F3FF",border:"#339AF0"},
        {title:"📅 Haftalık Rapor",desc:"Haftalık ilerleme, uyum oranı ve özet",route:"/weekly-reports",color:"#E5FFE5",border:"#51CF66"}].map(r=>(
        <TouchableOpacity key={r.route} onPress={()=>router.push(r.route as any)}
          style={{backgroundColor:r.color,borderRadius:14,padding:20,borderWidth:2,borderColor:r.border,gap:8}}>
          <Text style={{fontSize:20,fontWeight:"700",color:"#1a1a1a"}}>{r.title}</Text>
          <Text style={{color:"#555",fontSize:14}}>{r.desc}</Text>
          <Text style={{color:r.border,fontWeight:"600"}}>Görüntüle →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </ScreenContainer>);
}
