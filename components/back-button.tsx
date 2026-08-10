import {TouchableOpacity,Text,View} from "react-native";
import {useRouter} from "expo-router";
import {useColors} from "@/hooks/use-colors";
interface P{title?:string;onBack?:()=>void;}
export function BackButton({title,onBack}:P){
  const router=useRouter();const colors=useColors();
  const go=()=>{if(onBack){onBack();return;}if(router.canGoBack())router.back();else router.replace("/features-menu");};
  return(<View style={{flexDirection:"row",alignItems:"center",paddingHorizontal:16,paddingTop:12,paddingBottom:8,gap:8}}>
    <TouchableOpacity onPress={go} style={{flexDirection:"row",alignItems:"center",gap:4,paddingVertical:6,paddingHorizontal:10,borderRadius:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
      <Text style={{fontSize:16,color:colors.primary}}>←</Text>
      <Text style={{fontSize:14,color:colors.primary,fontWeight:"600"}}>Geri</Text>
    </TouchableOpacity>
    {title&&<Text style={{fontSize:18,fontWeight:"700",color:colors.foreground,flex:1}}>{title}</Text>}
  </View>);
}
