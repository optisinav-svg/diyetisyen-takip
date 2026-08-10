import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useRouter} from "expo-router";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BackButton} from "@/components/back-button";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const HEALTH_KEY="health_records_v2";const WEARABLE_KEY="wearable_data";
const CLIENTS_DEFAULT=["Ayşe Yılmaz","Mehmet Demir","Fatma Kaya"];

export default function HealthScreen(){
  const router=useRouter();const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [tab,setTab]=useState<"overview"|"water"|"calorie"|"vitals">("overview");
  const [records,setRecords]=useState<any[]>([]);const [wearable,setWearable]=useState<any>(null);
  const [selClient,setSelClient]=useState(CLIENTS_DEFAULT[0]);
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [water,setWater]=useState("");const [calBurned,setCalBurned]=useState("");const [activity,setActivity]=useState("Yürüyüş");
  const [weight,setWeight]=useState("");const [bloodSugar,setBloodSugar]=useState("");const [bpSys,setBpSys]=useState("");const [bpDia,setBpDia]=useState("");const [height,setHeight]=useState("");

  const ACTIVITIES=["Yürüyüş","Koşu","Bisiklet","Yüzme","Yoga","Pilates","Ağırlık","Diğer"];

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const r=await AsyncStorage.getItem(HEALTH_KEY);if(r)setRecords(JSON.parse(r));
    const w=await AsyncStorage.getItem(WEARABLE_KEY);if(w)setWearable(JSON.parse(w));
    const c=await getMyClients();setClients(c);
  };
  const saveRecord=async(data:any)=>{
    const today=new Date().toISOString().split("T")[0];
    const existing=records.find(r=>r.date===today);
    const up=existing?records.map(r=>r.date===today?{...r,...data}:r):[...records,{date:today,...data}];
    setRecords(up);await AsyncStorage.setItem(HEALTH_KEY,JSON.stringify(up));
  };
  const today=records.find(r=>r.date===new Date().toISOString().split("T")[0]);
  const calcBMI=(w:number,h:number)=>{const hm=h/100;return(w/(hm*hm)).toFixed(1);};
  const bmi=weight&&height?calcBMI(Number(weight),Number(height)):null;
  const bmiCat=(b:number)=>b<18.5?{l:"Zayıf",c:"#3b82f6"}:b<25?{l:"Normal",c:"#22c55e"}:b<30?{l:"Fazla Kilolu",c:"#f97316"}:{l:"Obez",c:"#ef4444"};
  const bmiInfo=bmi?bmiCat(Number(bmi)):null;

  return(<ScreenContainer>
    <BackButton title="📈 Sağlık Verileri"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"overview",l:"📊 Özet"},{k:"water",l:"💧 Su"},{k:"calorie",l:"🔥 Kalori"},{k:"vitals",l:"🩺 Ölçümler"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
              style={{paddingHorizontal:14,paddingVertical:10,borderRadius:20,backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
              <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {tab==="overview"&&(<>
        {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c.name)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient===c.name?colors.primary:colors.surface,borderWidth:1,borderColor:selClient===c.name?colors.primary:colors.border}}>
              <Text style={{color:selClient===c.name?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>}
        {wearable&&<View style={{backgroundColor:"#22c55e20",borderRadius:12,padding:14,borderWidth:1,borderColor:"#22c55e",gap:10}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <Text style={{fontWeight:"700",color:"#22c55e"}}>⌚ Akıllı Saat Verileri</Text>
            <Text style={{fontSize:11,color:colors.muted}}>Son: {wearable.lastSync}</Text>
          </View>
          <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
            {[{icon:"💧",l:"Su",v:`${wearable.water??0} ml`},{icon:"🔥",l:"Kalori",v:`${wearable.caloriesBurned} kcal`},{icon:"👟",l:"Adım",v:wearable.steps.toLocaleString()},{icon:"❤️",l:"Nabız",v:`${wearable.heartRate} bpm`}].map(i=>(
              <View key={i.l} style={{flex:1,minWidth:"45%",backgroundColor:colors.surface,borderRadius:8,padding:10,borderWidth:1,borderColor:"#22c55e40"}}>
                <Text style={{fontSize:16}}>{i.icon}</Text><Text style={{fontWeight:"700",color:colors.foreground}}>{i.v}</Text><Text style={{fontSize:11,color:colors.muted}}>{i.l}</Text>
              </View>
            ))}
          </View>
        </View>}
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
          {[{icon:"⚖️",l:"Kilo",v:today?.weight?`${today.weight} kg`:"—",c:"#22c55e",t:"vitals"},{icon:"🩸",l:"Kan Şekeri",v:today?.bloodSugar?`${today.bloodSugar} mg/dL`:"—",c:"#ef4444",t:"vitals"},{icon:"💓",l:"Tansiyon",v:today?.bloodPressureSystolic?`${today.bloodPressureSystolic}/${today.bloodPressureDiastolic}`:"—",c:"#8b5cf6",t:"vitals"},{icon:"📏",l:"BMI",v:today?.bmi?`${today.bmi}`:"—",c:"#f59e0b",t:"vitals"}].map(card=>(
            <TouchableOpacity key={card.l} onPress={()=>setTab(card.t as any)} style={{width:"47%",backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:4}}>
              <Text style={{fontSize:24}}>{card.icon}</Text><Text style={{fontSize:18,fontWeight:"bold",color:card.c}}>{card.v}</Text><Text style={{fontSize:12,color:colors.muted}}>{card.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!wearable&&<TouchableOpacity onPress={()=>router.push("/wearable-sync")} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.primary}}>
          <Text style={{color:colors.primary,fontWeight:"700"}}>⌚ Akıllı Saat Bağla</Text>
        </TouchableOpacity>}
      </>)}

      {tab==="water"&&(<>
        <View style={{backgroundColor:"#3b82f620",borderRadius:12,padding:16,borderWidth:1,borderColor:"#3b82f6",gap:10}}>
          <Text style={{fontSize:16,fontWeight:"700",color:"#3b82f6"}}>💧 Su Tüketimi</Text>
          <Text style={{color:colors.foreground}}>Bugün: <Text style={{fontWeight:"700",fontSize:18}}>{today?.waterIntake??0} ml</Text></Text>
          <View style={{height:10,backgroundColor:colors.border,borderRadius:5}}>
            <View style={{height:10,backgroundColor:"#3b82f6",borderRadius:5,width:`${Math.min(((today?.waterIntake??0)/2000)*100,100)}%`}}/>
          </View>
          <Text style={{color:colors.muted,fontSize:12}}>Hedef: 2000 ml</Text>
        </View>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
          {[150,200,250,300,500].map(ml=>(<TouchableOpacity key={ml} onPress={async()=>{await saveRecord({waterIntake:(today?.waterIntake??0)+ml});Alert.alert("Eklendi",`${ml} ml su eklendi!`);}}
            style={{paddingHorizontal:20,paddingVertical:12,borderRadius:12,backgroundColor:"#3b82f620",borderWidth:2,borderColor:"#3b82f6"}}>
            <Text style={{color:"#3b82f6",fontWeight:"700"}}>{ml} ml</Text>
          </TouchableOpacity>))}
        </View>
        <View style={{flexDirection:"row",gap:8}}>
          <TextInput value={water} onChangeText={setWater} placeholder="ml cinsinden" keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{flex:1,borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <TouchableOpacity onPress={async()=>{if(!water)return;await saveRecord({waterIntake:(today?.waterIntake??0)+Number(water)});setWater("");Alert.alert("Eklendi!");}}
            style={{paddingHorizontal:16,borderRadius:10,backgroundColor:"#3b82f6",justifyContent:"center"}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </>)}

      {tab==="calorie"&&(<>
        <View style={{gap:6}}>
          <Text style={{fontWeight:"600",color:colors.foreground}}>Aktivite Türü</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8}}>
              {ACTIVITIES.map(a=>(<TouchableOpacity key={a} onPress={()=>setActivity(a)}
                style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:activity===a?"#f97316":colors.surface,borderWidth:1,borderColor:activity===a?"#f97316":colors.border}}>
                <Text style={{color:activity===a?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{a}</Text>
              </TouchableOpacity>))}
            </View>
          </ScrollView>
        </View>
        <View style={{flexDirection:"row",gap:8}}>
          <TextInput value={calBurned} onChangeText={setCalBurned} placeholder="kcal" keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{flex:1,borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <TouchableOpacity onPress={async()=>{if(!calBurned)return;await saveRecord({caloriesBurned:(today?.caloriesBurned??0)+Number(calBurned)});setCalBurned("");Alert.alert("Kaydedildi!",`${activity} aktivitesi kaydedildi.`);}}
            style={{paddingHorizontal:16,borderRadius:10,backgroundColor:"#f97316",justifyContent:"center"}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </>)}

      {tab==="vitals"&&(<>
        {role==="client"?(<>
          <View style={{backgroundColor:"#3b82f620",borderRadius:10,padding:12,borderWidth:1,borderColor:"#3b82f6"}}>
            <Text style={{color:"#3b82f6",fontSize:13}}>ℹ️ Bu bilgiler diyetisyeniniz tarafından girilir. Siz sadece görüntüleyebilirsiniz.</Text>
          </View>
          {[{icon:"⚖️",l:"Kilo",v:today?.weight?`${today.weight} kg`:"Henüz girilmedi",c:"#22c55e"},{icon:"🩸",l:"Kan Şekeri",v:today?.bloodSugar?`${today.bloodSugar} mg/dL`:"Henüz girilmedi",c:"#ef4444"},{icon:"💓",l:"Tansiyon",v:today?.bloodPressureSystolic?`${today.bloodPressureSystolic}/${today.bloodPressureDiastolic} mmHg`:"Henüz girilmedi",c:"#8b5cf6"},{icon:"📏",l:"BMI",v:today?.bmi?`${today.bmi}`:"Henüz girilmedi",c:"#f59e0b"}].map(i=>(
            <View key={i.l} style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:12}}>
              <Text style={{fontSize:28}}>{i.icon}</Text><View><Text style={{fontSize:13,color:colors.muted}}>{i.l}</Text><Text style={{fontSize:18,fontWeight:"700",color:i.c}}>{i.v}</Text></View>
            </View>
          ))}
        </>):(<>
          <View style={{backgroundColor:"#22c55e20",borderRadius:10,padding:10,borderWidth:1,borderColor:"#22c55e"}}>
            <Text style={{color:"#22c55e",fontSize:13}}>👨‍⚕️ Bu ölçümleri siz giriyorsunuz. Danışan sadece görüntüleyebilir.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8}}>
              {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c.name)}
                style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient===c.name?colors.primary:colors.surface,borderWidth:1,borderColor:selClient===c.name?colors.primary:colors.border}}>
                <Text style={{color:selClient===c.name?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
              </TouchableOpacity>))}
            </View>
          </ScrollView>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
            <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>📏 BMI Hesaplama</Text>
            <View style={{flexDirection:"row",gap:10}}>
              <View style={{flex:1,gap:4}}><Text style={{fontSize:13,color:colors.muted}}>Boy (cm)</Text>
                <TextInput value={height} onChangeText={setHeight} placeholder="165" keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:10,color:colors.foreground,backgroundColor:colors.background}}/>
              </View>
              <View style={{flex:1,gap:4}}><Text style={{fontSize:13,color:colors.muted}}>Kilo (kg)</Text>
                <TextInput value={weight} onChangeText={setWeight} placeholder="70" keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:10,color:colors.foreground,backgroundColor:colors.background}}/>
              </View>
            </View>
            {bmi&&bmiInfo&&<View style={{backgroundColor:bmiInfo.c+"20",borderRadius:10,padding:12,borderWidth:1,borderColor:bmiInfo.c}}>
              <Text style={{fontSize:24,fontWeight:"bold",color:bmiInfo.c}}>BMI: {bmi}</Text>
              <Text style={{color:bmiInfo.c,fontWeight:"600"}}>{bmiInfo.l}</Text>
            </View>}
          </View>
          {[{l:"Kan Şekeri (mg/dL)",v:bloodSugar,s:setBloodSugar,ph:"örn: 95"},{l:"Sistolik Tansiyon (mmHg)",v:bpSys,s:setBpSys,ph:"örn: 120"},{l:"Diyastolik Tansiyon (mmHg)",v:bpDia,s:setBpDia,ph:"örn: 80"}].map(f=>(
            <View key={f.l} style={{gap:6}}>
              <Text style={{fontWeight:"600",color:colors.foreground}}>{f.l}</Text>
              <TextInput value={f.v} onChangeText={f.s} placeholder={f.ph} keyboardType="numeric" placeholderTextColor={colors.muted}
                style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
            </View>
          ))}
          <TouchableOpacity onPress={async()=>{const b=weight&&height?Number(calcBMI(Number(weight),Number(height))):undefined;await saveRecord({weight:weight?Number(weight):undefined,bloodSugar:bloodSugar?Number(bloodSugar):undefined,bloodPressureSystolic:bpSys?Number(bpSys):undefined,bloodPressureDiastolic:bpDia?Number(bpDia):undefined,bmi:b,enteredBy:"dietitian"});Alert.alert("Kaydedildi",`${selClient} için ölçümler güncellendi.`);}}
            style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>💾 {selClient} için Kaydet</Text>
          </TouchableOpacity>
        </>)}
      </>)}
    </ScrollView>
  </ScreenContainer>);
}
