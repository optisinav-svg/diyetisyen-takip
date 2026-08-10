import {BackButton} from "@/components/back-button";
import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal,KeyboardAvoidingView,Platform} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const GOALS_KEY="micro_goals_v3";const LOG_KEY="micro_log_v3";const MSGS_KEY="chat_v3";

interface MicroGoal{nutrientId:string;clientId:string;clientName:string;nutrient:string;unit:string;dailyTarget:number;weeklyTarget:number;icon:string;}
interface MicroLog{id:string;clientId:string;nutrientId:string;nutrient:string;amount:number;unit:string;foodSource:string;date:string;}

const NUTRIENTS=[
  {id:"vit-c",name:"C Vitamini",unit:"mg",icon:"🍊",defaultDaily:90,foods:["Portakal","Limon","Kivi","Çilek","Biber","Brokoli"]},
  {id:"vit-d",name:"D Vitamini",unit:"mcg",icon:"☀️",defaultDaily:20,foods:["Somon","Ton balığı","Yumurta","Süt","Mantar"]},
  {id:"vit-b12",name:"B12 Vitamini",unit:"mcg",icon:"💊",defaultDaily:2.4,foods:["Et","Tavuk","Balık","Yumurta","Peynir"]},
  {id:"iron",name:"Demir",unit:"mg",icon:"🔴",defaultDaily:18,foods:["Kırmızı et","Mercimek","Ispanak","Fasulye","Susam"]},
  {id:"calcium",name:"Kalsiyum",unit:"mg",icon:"🦴",defaultDaily:1000,foods:["Süt","Peynir","Yoğurt","Brokoli","Badem"]},
  {id:"magnesium",name:"Magnezyum",unit:"mg",icon:"⚡",defaultDaily:400,foods:["Kabak çekirdeği","Badem","Ispanak","Avokado"]},
  {id:"zinc",name:"Çinko",unit:"mg",icon:"🔵",defaultDaily:11,foods:["Kabak çekirdeği","Kırmızı et","Ceviz","Nohut"]},
  {id:"omega3",name:"Omega-3",unit:"g",icon:"🐟",defaultDaily:1.6,foods:["Somon","Uskumru","Keten tohumu","Ceviz"]},
  {id:"fiber",name:"Lif",unit:"g",icon:"🌾",defaultDaily:25,foods:["Sebze","Meyve","Tam tahıl","Baklagiller"]},
  {id:"folic",name:"Folik Asit",unit:"mcg",icon:"🌿",defaultDaily:400,foods:["Ispanak","Mercimek","Fasulye","Avokado"]},
  {id:"potassium",name:"Potasyum",unit:"mg",icon:"🍌",defaultDaily:4700,foods:["Muz","Patates","Fasulye","Avokado"]},
  {id:"vit-a",name:"A Vitamini",unit:"mcg",icon:"🥕",defaultDaily:900,foods:["Havuç","Tatlı patates","Ispanak","Kayısı"]},
];

const FOOD_MAP:Record<string,Partial<Record<string,number>>>={
  "Portakal":{"vit-c":70},"Somon":{"vit-d":15,"omega3":2.2},"Ispanak":{"iron":3.6,"calcium":240,"folic":194,"vit-a":469},
  "Mercimek":{"iron":6.6,"folic":358,"fiber":15.6},"Süt":{"calcium":300,"vit-d":3},"Badem":{"calcium":264,"magnesium":270},
  "Muz":{"potassium":422},"Keten tohumu":{"omega3":6.4,"fiber":7.7},"Havuç":{"vit-a":835},"Yumurta":{"vit-b12":0.6,"vit-d":2},
};

export default function MicronutrientTrackingScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [goals,setGoals]=useState<MicroGoal[]>([]);const [logs,setLogs]=useState<MicroLog[]>([]);
  const [clients,setClients]=useState<ClientRecord[]>([]);const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [tab,setTab]=useState<"overview"|"log"|"goals">("overview");
  const [showGoalModal,setShowGoalModal]=useState(false);const [showLogModal,setShowLogModal]=useState(false);
  const [selNutrient,setSelNutrient]=useState(NUTRIENTS[0]);
  const [goalDaily,setGoalDaily]=useState("");const [goalWeekly,setGoalWeekly]=useState("");
  const [logAmount,setLogAmount]=useState("");const [logFood,setLogFood]=useState("");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const g=await AsyncStorage.getItem(GOALS_KEY);if(g)setGoals(JSON.parse(g));
    const l=await AsyncStorage.getItem(LOG_KEY);if(l)setLogs(JSON.parse(l));
  };
  const saveGoals=async(list:MicroGoal[])=>{setGoals(list);await AsyncStorage.setItem(GOALS_KEY,JSON.stringify(list));};
  const saveLogs=async(list:MicroLog[])=>{setLogs(list);await AsyncStorage.setItem(LOG_KEY,JSON.stringify(list));};

  const saveGoal=async()=>{
    if(!goalDaily){Alert.alert("Hata","Günlük hedef girin");return;}
    if(!selClient&&role==="dietitian"){Alert.alert("Hata","Danışan seçin");return;}
    const cid=role==="dietitian"?selClient!.id:"me";
    const cname=role==="dietitian"?selClient!.name:"Ben";
    const g:MicroGoal={nutrientId:selNutrient.id,clientId:cid,clientName:cname,nutrient:selNutrient.name,unit:selNutrient.unit,dailyTarget:Number(goalDaily),weeklyTarget:Number(goalWeekly)||Number(goalDaily)*7,icon:selNutrient.icon};
    await saveGoals([...goals.filter(x=>!(x.nutrientId===selNutrient.id&&x.clientId===cid)),g]);
    if(role==="dietitian"&&selClient){
      const msg={id:Date.now().toString(),senderId:"dietitian",senderName:"Diyetisyeniniz",content:`📊 Yeni mikro besin hedefi: ${selNutrient.icon} ${selNutrient.name} — Günlük ${goalDaily} ${selNutrient.unit}${goalWeekly?`, Haftalık ${goalWeekly} ${selNutrient.unit}`:""}`,createdAt:new Date().toISOString(),status:"delivered"};
      const saved=await AsyncStorage.getItem(MSGS_KEY);const all=saved?JSON.parse(saved):{};
      all[selClient.id]=[...(all[selClient.id]??[]),msg];await AsyncStorage.setItem(MSGS_KEY,JSON.stringify(all));
    }
    setShowGoalModal(false);setGoalDaily("");setGoalWeekly("");
    Alert.alert("✅ Hedef Belirlendi",`${cname}'a mesaj gönderildi.`);
  };

  const addLog=async()=>{
    if(!logAmount){Alert.alert("Hata","Miktar girin");return;}
    const today=new Date().toISOString().split("T")[0];
    const cid=role==="client"?"me":selClient?.id??"me";
    const entry:MicroLog={id:Date.now().toString(),clientId:cid,nutrientId:selNutrient.id,nutrient:selNutrient.name,amount:Number(logAmount),unit:selNutrient.unit,foodSource:logFood||"Manuel giriş",date:today};
    const autoLogs:MicroLog[]=[];
    if(logFood&&FOOD_MAP[logFood]){
      Object.entries(FOOD_MAP[logFood]!).forEach(([nid,amt])=>{
        if(nid!==selNutrient.id){const n=NUTRIENTS.find(x=>x.id===nid);if(n)autoLogs.push({id:`${Date.now()}_${nid}`,clientId:cid,nutrientId:nid,nutrient:n.name,amount:amt!,unit:n.unit,foodSource:logFood,date:today});}
      });
    }
    await saveLogs([...logs,entry,...autoLogs]);
    setShowLogModal(false);setLogAmount("");setLogFood("");
    if(autoLogs.length>0)Alert.alert("✅ Kaydedildi",`${selNutrient.name} eklendi!\n${logFood} kaynaklı ${autoLogs.length} besin daha otomatik eklendi.`);
    else Alert.alert("✅ Kaydedildi");
  };

  const today=new Date().toISOString().split("T")[0];
  const cid=role==="client"?"me":selClient?.id??"me";
  const clientGoals=goals.filter(g=>g.clientId===cid);
  const todayLogs=logs.filter(l=>l.date===today&&l.clientId===cid);
  const getTotal=(nid:string)=>todayLogs.filter(l=>l.nutrientId===nid).reduce((s,l)=>s+l.amount,0);

  const CS=()=>role==="dietitian"?(<ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={{flexDirection:"row",gap:8}}>
      {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
        style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
        <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
      </TouchableOpacity>))}
    </View>
  </ScrollView>):null;

  return(<ScreenContainer>
    <BackButton title="🔬 Mikro Besin Takibi"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"overview",l:"📊 Özet"},{k:"log",l:"➕ Kayıt Ekle"},{k:"goals",l:"🎯 Hedef Belirle"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
              style={{paddingHorizontal:16,paddingVertical:10,borderRadius:20,backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
              <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <CS/>

      {tab==="overview"&&(<>
        <Text style={{color:colors.muted,fontSize:13}}>Bugünkü mikro besin alımı</Text>
        {clientGoals.length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>{role==="dietitian"?"Henüz hedef belirlenmedi.":"Diyetisyeniniz henüz hedef belirlemedi."}</Text>
          :clientGoals.map(g=>{const total=getTotal(g.nutrientId);const pct=g.dailyTarget>0?Math.min((total/g.dailyTarget)*100,100):0;return(
            <View key={g.nutrientId} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,gap:8,borderWidth:1,borderColor:pct>=100?"#22c55e":colors.border}}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                <Text style={{fontWeight:"700",color:colors.foreground}}>{g.icon} {g.nutrient}</Text>
                <Text style={{color:pct>=100?"#22c55e":colors.primary,fontWeight:"700"}}>{total}/{g.dailyTarget} {g.unit}</Text>
              </View>
              <View style={{height:8,backgroundColor:colors.border,borderRadius:4}}>
                <View style={{height:8,borderRadius:4,width:`${pct}%`,backgroundColor:pct>=100?"#22c55e":pct>=60?"#f97316":"#ef4444"}}/>
              </View>
              <Text style={{color:colors.muted,fontSize:11}}>{pct.toFixed(0)}% tamamlandı</Text>
            </View>
          );})}
      </>)}

      {tab==="log"&&(<>
        <Text style={{color:colors.muted,fontSize:13}}>Yediğiniz besini seçin — ilgili mikro besinler otomatik eklenir</Text>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
          {NUTRIENTS.map(n=>(<TouchableOpacity key={n.id} onPress={()=>{setSelNutrient(n);setShowLogModal(true);}}
            style={{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:6}}>
            <Text style={{fontSize:18}}>{n.icon}</Text>
            <Text style={{color:colors.foreground,fontWeight:"600",fontSize:13}}>{n.name}</Text>
          </TouchableOpacity>))}
        </View>
        {todayLogs.length>0&&<View style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:8}}>
          <Text style={{fontWeight:"700",color:colors.foreground}}>📋 Bugünkü Kayıtlar</Text>
          {todayLogs.map(l=>(<View key={l.id} style={{flexDirection:"row",justifyContent:"space-between",paddingVertical:4,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={{color:colors.foreground}}>{l.nutrient} — {l.foodSource}</Text>
            <Text style={{color:colors.primary,fontWeight:"600"}}>{l.amount}{l.unit}</Text>
          </View>))}
        </View>}
      </>)}

      {tab==="goals"&&(<>
        {role==="dietitian"?(<>
          <Text style={{color:colors.muted,fontSize:13}}>Danışan ve besin seçerek hedef belirleyin. Hedef mesaj olarak danışana iletilir.</Text>
          <TouchableOpacity onPress={()=>setShowGoalModal(true)} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>+ Hedef Belirle</Text>
          </TouchableOpacity>
          {clientGoals.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>{selClient?.name} için henüz hedef yok.</Text>
            :clientGoals.map(g=>(<View key={g.nutrientId} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:10}}>
              <Text style={{fontSize:24}}>{g.icon}</Text>
              <View style={{flex:1}}>
                <Text style={{fontWeight:"700",color:colors.foreground}}>{g.nutrient}</Text>
                <Text style={{color:colors.muted,fontSize:12}}>Günlük: {g.dailyTarget} {g.unit} · Haftalık: {g.weeklyTarget} {g.unit}</Text>
              </View>
              <TouchableOpacity onPress={()=>{setSelNutrient(NUTRIENTS.find(n=>n.id===g.nutrientId)??NUTRIENTS[0]);setGoalDaily(String(g.dailyTarget));setGoalWeekly(String(g.weeklyTarget));setShowGoalModal(true);}}>
                <Text style={{color:colors.primary,fontSize:13}}>Düzenle</Text>
              </TouchableOpacity>
            </View>))}
        </>):(<>
          <Text style={{color:colors.muted,fontSize:13}}>Diyetisyeninizin belirlediği hedefler</Text>
          {clientGoals.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>Henüz hedef belirlenmedi.</Text>
            :clientGoals.map(g=>(<View key={g.nutrientId} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border}}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                <Text style={{fontWeight:"700",color:colors.foreground}}>{g.icon} {g.nutrient}</Text>
                <Text style={{color:colors.primary,fontWeight:"700"}}>Günlük: {g.dailyTarget} {g.unit}</Text>
              </View>
              <Text style={{color:colors.muted,fontSize:12,marginTop:4}}>Haftalık hedef: {g.weeklyTarget} {g.unit}</Text>
            </View>))}
        </>)}
      </>)}
    </ScrollView>

    <Modal visible={showGoalModal} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
          <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14,paddingBottom:Math.max(insets.bottom+16,24)}}>
            <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>🎯 Hedef Belirle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{flexDirection:"row",gap:8}}>
                {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
                  style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
                  <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>{c.name}</Text>
                </TouchableOpacity>))}
              </View>
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{flexDirection:"row",gap:8}}>
                {NUTRIENTS.map(n=>(<TouchableOpacity key={n.id} onPress={()=>setSelNutrient(n)}
                  style={{paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:selNutrient.id===n.id?colors.primary:colors.surface,borderWidth:1,borderColor:selNutrient.id===n.id?colors.primary:colors.border}}>
                  <Text style={{color:selNutrient.id===n.id?"#fff":colors.foreground,fontSize:12,fontWeight:"600"}}>{n.icon} {n.name}</Text>
                </TouchableOpacity>))}
              </View>
            </ScrollView>
            <View style={{flexDirection:"row",gap:10}}>
              <View style={{flex:1,gap:4}}>
                <Text style={{fontWeight:"600",color:colors.foreground}}>Günlük ({selNutrient.unit})</Text>
                <TextInput value={goalDaily} onChangeText={setGoalDaily} placeholder={String(selNutrient.defaultDaily)} keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
              </View>
              <View style={{flex:1,gap:4}}>
                <Text style={{fontWeight:"600",color:colors.foreground}}>Haftalık ({selNutrient.unit})</Text>
                <TextInput value={goalWeekly} onChangeText={setGoalWeekly} placeholder={String(selNutrient.defaultDaily*7)} keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
              </View>
            </View>
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity onPress={()=>{setShowGoalModal(false);setGoalDaily("");setGoalWeekly("");}} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
                <Text style={{color:colors.foreground}}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveGoal} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
                <Text style={{color:"#fff",fontWeight:"700"}}>✅ Kaydet ve Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>

    <Modal visible={showLogModal} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
          <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14,paddingBottom:Math.max(insets.bottom+16,24)}}>
            <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>{selNutrient.icon} {selNutrient.name} Ekle</Text>
            <View style={{gap:6}}>
              <Text style={{fontWeight:"600",color:colors.foreground}}>🍽️ Besin Kaynağı</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{flexDirection:"row",gap:8}}>
                  {selNutrient.foods.map(f=>(<TouchableOpacity key={f} onPress={()=>setLogFood(f)}
                    style={{paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:logFood===f?colors.primary:colors.surface,borderWidth:1,borderColor:logFood===f?colors.primary:colors.border}}>
                    <Text style={{color:logFood===f?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{f}</Text>
                  </TouchableOpacity>))}
                </View>
              </ScrollView>
              {logFood&&FOOD_MAP[logFood]&&<Text style={{color:"#22c55e",fontSize:12}}>✅ {logFood} seçilince ilgili diğer besinler de otomatik eklenir</Text>}
            </View>
            <View style={{gap:4}}>
              <Text style={{fontWeight:"600",color:colors.foreground}}>Miktar ({selNutrient.unit})</Text>
              <TextInput value={logAmount} onChangeText={setLogAmount} placeholder={String(selNutrient.defaultDaily)} keyboardType="numeric" placeholderTextColor={colors.muted}
                style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,fontSize:16}}/>
            </View>
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity onPress={()=>{setShowLogModal(false);setLogAmount("");setLogFood("");}} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
                <Text style={{color:colors.foreground}}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addLog} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
                <Text style={{color:"#fff",fontWeight:"700"}}>✅ Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </ScreenContainer>);
}
