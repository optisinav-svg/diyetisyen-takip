import {ScrollView,Text,View,TouchableOpacity,Alert,Switch} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const WEARABLE_KEY="wearable_data";
const WEARABLE_SETTINGS_KEY="wearable_settings";

interface WearableData{steps:number;heartRate:number;caloriesBurned:number;sleep:number;water:number;activeMinutes:number;lastSync:string;connected:boolean;deviceName:string;}
interface Settings{autoSync:boolean;syncInterval:string;shareWithDietitian:boolean;}

const DEVICES=[
  {id:"apple",name:"Apple Watch",icon:"⌚",brand:"Apple"},
  {id:"garmin",name:"Garmin",icon:"🏃",brand:"Garmin"},
  {id:"fitbit",name:"Fitbit",icon:"💪",brand:"Fitbit"},
  {id:"samsung",name:"Samsung Galaxy Watch",icon:"⌚",brand:"Samsung"},
  {id:"xiaomi",name:"Mi Band / Redmi Watch",icon:"📿",brand:"Xiaomi"},
  {id:"huawei",name:"Huawei Band",icon:"⌚",brand:"Huawei"},
];

export default function WearableSyncScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [wearable,setWearable]=useState<WearableData|null>(null);
  const [settings,setSettings]=useState<Settings>({autoSync:true,syncInterval:"15 dakika",shareWithDietitian:true});
  const [connecting,setConnecting]=useState(false);

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const w=await AsyncStorage.getItem(WEARABLE_KEY);if(w)setWearable(JSON.parse(w));
    const s=await AsyncStorage.getItem(WEARABLE_SETTINGS_KEY);if(s)setSettings(JSON.parse(s));
  };
  const saveSettings=async(s:Settings)=>{setSettings(s);await AsyncStorage.setItem(WEARABLE_SETTINGS_KEY,JSON.stringify(s));};

  const connectDevice=async(device:typeof DEVICES[0])=>{
    setConnecting(true);
    setTimeout(async()=>{
      const data:WearableData={steps:8432,heartRate:72,caloriesBurned:1840,sleep:7.5,water:1600,activeMinutes:45,lastSync:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}),connected:true,deviceName:device.name};
      setWearable(data);await AsyncStorage.setItem(WEARABLE_KEY,JSON.stringify(data));
      setConnecting(false);Alert.alert("✅ Bağlandı!",`${device.name} başarıyla bağlandı.\n\nVeriler senkronize edildi.`);
    },2000);
  };

  const disconnect=async()=>{
    Alert.alert("Bağlantıyı Kes","Akıllı saati ayırmak istiyor musunuz?",[
      {text:"İptal",style:"cancel"},
      {text:"Ayır",style:"destructive",onPress:async()=>{setWearable(null);await AsyncStorage.removeItem(WEARABLE_KEY);}},
    ]);
  };

  const sync=async()=>{
    if(!wearable)return;
    const updated={...wearable,steps:wearable.steps+Math.floor(Math.random()*500),heartRate:65+Math.floor(Math.random()*20),lastSync:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})};
    setWearable(updated);await AsyncStorage.setItem(WEARABLE_KEY,JSON.stringify(updated));
    Alert.alert("✅ Senkronize edildi","Veriler güncellendi.");
  };

  return(<ScreenContainer>
    <BackButton title="⌚ Akıllı Saat"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {wearable?.connected?(<>
        <View style={{backgroundColor:"#22c55e20",borderRadius:14,padding:16,borderWidth:2,borderColor:"#22c55e",gap:12}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
              <Text style={{fontSize:32}}>⌚</Text>
              <View><Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{wearable.deviceName}</Text>
                <Text style={{color:"#22c55e",fontSize:12,fontWeight:"600"}}>✅ Bağlı · Son sync: {wearable.lastSync}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={sync} style={{paddingHorizontal:12,paddingVertical:6,borderRadius:8,backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"600",fontSize:12}}>🔄 Sync</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
          {[{icon:"👟",label:"Adım",value:wearable.steps.toLocaleString("tr-TR"),unit:"adım",color:"#22c55e"},
            {icon:"❤️",label:"Nabız",value:String(wearable.heartRate),unit:"bpm",color:"#ef4444"},
            {icon:"🔥",label:"Kalori",value:String(wearable.caloriesBurned),unit:"kcal",color:"#f97316"},
            {icon:"😴",label:"Uyku",value:String(wearable.sleep),unit:"saat",color:"#8b5cf6"},
            {icon:"💧",label:"Su",value:String(wearable.water),unit:"ml",color:"#3b82f6"},
            {icon:"⚡",label:"Aktif",value:String(wearable.activeMinutes),unit:"dakika",color:"#f59e0b"},
          ].map(item=>(
            <View key={item.label} style={{width:"47%",backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:item.color+"40",gap:4}}>
              <Text style={{fontSize:24}}>{item.icon}</Text>
              <Text style={{fontSize:20,fontWeight:"bold",color:item.color}}>{item.value}</Text>
              <Text style={{fontSize:11,color:colors.muted}}>{item.label} · {item.unit}</Text>
            </View>
          ))}
        </View>

        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
          <Text style={{fontWeight:"700",color:colors.foreground}}>⚙️ Ayarlar</Text>
          {[{l:"🔄 Otomatik Senkronizasyon",s:"autoSync",sub:"Arka planda otomatik günceller"},{l:"👨‍⚕️ Diyetisyenle Paylaş",s:"shareWithDietitian",sub:"Veriler diyetisyeninizle paylaşılır"}].map(item=>(
            <View key={item.l} style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:6}}>
              <View style={{flex:1}}><Text style={{color:colors.foreground}}>{item.l}</Text><Text style={{color:colors.muted,fontSize:11}}>{item.sub}</Text></View>
              <Switch value={settings[item.s as keyof Settings] as boolean} onValueChange={v=>saveSettings({...settings,[item.s]:v})} trackColor={{false:colors.border,true:colors.primary}}/>
            </View>
          ))}
          {settings.autoSync&&<View style={{gap:6}}>
            <Text style={{color:colors.muted,fontSize:13}}>Sync Aralığı</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{flexDirection:"row",gap:8}}>
                {["5 dakika","15 dakika","30 dakika","1 saat"].map(i=>(
                  <TouchableOpacity key={i} onPress={()=>saveSettings({...settings,syncInterval:i})}
                    style={{paddingHorizontal:14,paddingVertical:6,borderRadius:16,backgroundColor:settings.syncInterval===i?colors.primary:colors.surface,borderWidth:1,borderColor:settings.syncInterval===i?colors.primary:colors.border}}>
                    <Text style={{color:settings.syncInterval===i?"#fff":colors.foreground,fontSize:12,fontWeight:"600"}}>{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>}
        </View>

        <TouchableOpacity onPress={disconnect} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:"#ef444420",borderWidth:1,borderColor:"#ef4444"}}>
          <Text style={{color:"#ef4444",fontWeight:"700"}}>⌚ Bağlantıyı Kes</Text>
        </TouchableOpacity>
      </>):(
        <View style={{gap:14}}>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border}}>
            <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16,marginBottom:8}}>⌚ Akıllı Saat Bağla</Text>
            <Text style={{color:colors.muted,fontSize:13,lineHeight:20}}>Akıllı saatinizi bağlayarak adım, nabız, kalori, uyku ve su verilerinizi otomatik takip edin.</Text>
          </View>
          {connecting&&<View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,alignItems:"center",gap:8}}>
            <Text style={{fontSize:32}}>🔄</Text>
            <Text style={{color:colors.primary,fontWeight:"700"}}>Bağlanıyor...</Text>
          </View>}
          {!connecting&&DEVICES.map(d=>(
            <TouchableOpacity key={d.id} onPress={()=>connectDevice(d)}
              style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:12}}>
              <Text style={{fontSize:32}}>{d.icon}</Text>
              <View style={{flex:1}}><Text style={{fontWeight:"700",color:colors.foreground}}>{d.name}</Text><Text style={{color:colors.muted,fontSize:12}}>{d.brand}</Text></View>
              <Text style={{color:colors.primary,fontWeight:"700"}}>Bağla →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  </ScreenContainer>);
}
