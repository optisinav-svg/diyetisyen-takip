import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal,FlatList,Image,Dimensions,KeyboardAvoidingView,Platform} from "react-native";
import {useState,useEffect} from "react";
import {ScreenContainer} from "@/components/screen-container";
import {useColors} from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import * as ImagePicker from "expo-image-picker";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const MEALS_KEY="meals_v3";const GOALS_KEY="nutrition_goals_v3";const PROG_KEY="goal_progress_v3";const WEARABLE_KEY="wearable_data";
const {width:SW}=Dimensions.get("window");

interface Meal{id:string;type:string;description:string;calories:number;photoUri?:string;date:string;items:string[];}
interface Goal{clientId:string;calories:number;protein:number;carbs:number;fat:number;water:number;steps:number;sleep:number;}
interface Prog{clientId:string;date:string;calories:number;protein:number;carbs:number;fat:number;water:number;steps:number;sleep:number;}

const TYPES=[{k:"breakfast",l:"🌅 Kahvaltı"},{k:"lunch",l:"☀️ Öğle"},{k:"dinner",l:"🌙 Akşam"},{k:"snack",l:"🍎 Ara Öğün"}];
const FOODS=["Yulaf ezmesi","Haşlanmış yumurta","Tam tahıllı ekmek","Yoğurt","Tavuk göğsü ızgara","Pirinç pilavı","Bulgur pilavı","Mercimek çorbası","Somon ızgara","Brokoli","Ispanak","Salata","Meyve","Badem","Ceviz","Süt","Peynir","Zeytinyağı","Domates","Salatalık"];

export default function MealsScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [clients,setClients]=useState<ClientRecord[]>([]);const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [meals,setMeals]=useState<Meal[]>([]);const [goals,setGoals]=useState<Goal|null>(null);const [prog,setProg]=useState<Prog|null>(null);const [wearable,setWearable]=useState<any>(null);
  const [tab,setTab]=useState<"log"|"today"|"goals"|"progress">("log");
  const [mType,setMType]=useState("breakfast");const [desc,setDesc]=useState("");const [cals,setCals]=useState("");const [photo,setPhoto]=useState("");const [selItems,setSelItems]=useState<string[]>([]);const [showFoods,setShowFoods]=useState(false);
  const [gForm,setGForm]=useState({calories:"2000",protein:"150",carbs:"250",fat:"65",water:"2000",steps:"10000",sleep:"8"});
  const [pForm,setPForm]=useState({calories:"",protein:"",carbs:"",fat:"",water:"",steps:"",sleep:""});

  useEffect(()=>{load();},[]);
  useEffect(()=>{if(selClient)loadClient(selClient.id);},[selClient]);

  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s){const p=JSON.parse(s);setRole(p.role??"client");}
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const m=await AsyncStorage.getItem(MEALS_KEY);if(m)setMeals(JSON.parse(m));
    const w=await AsyncStorage.getItem(WEARABLE_KEY);if(w)setWearable(JSON.parse(w));
    if(role==="client")await loadClient("me");
  };
  const loadClient=async(cid:string)=>{
    const today=new Date().toISOString().split("T")[0];
    const g=await AsyncStorage.getItem(`${GOALS_KEY}_${cid}`);if(g)setGoals(JSON.parse(g));
    const p=await AsyncStorage.getItem(`${PROG_KEY}_${cid}_${today}`);if(p)setProg(JSON.parse(p));
  };
  const saveMeal=async()=>{
    if(!desc.trim()&&selItems.length===0){Alert.alert("Hata","Öğün açıklaması veya yemek seçin");return;}
    const m:Meal={id:Date.now().toString(),type:mType,description:desc.trim()||selItems.join(", "),calories:Number(cals)||0,photoUri:photo||undefined,date:new Date().toISOString().split("T")[0],items:selItems};
    const up=[...meals,m];setMeals(up);await AsyncStorage.setItem(MEALS_KEY,JSON.stringify(up));
    setDesc("");setCals("");setPhoto("");setSelItems([]);Alert.alert("✅ Kaydedildi","Öğün eklendi!");
  };
  const saveGoals=async()=>{
    const cid=role==="dietitian"?selClient?.id??"me":"me";
    const g:Goal={clientId:cid,calories:Number(gForm.calories),protein:Number(gForm.protein),carbs:Number(gForm.carbs),fat:Number(gForm.fat),water:Number(gForm.water),steps:Number(gForm.steps),sleep:Number(gForm.sleep)};
    setGoals(g);await AsyncStorage.setItem(`${GOALS_KEY}_${cid}`,JSON.stringify(g));
    Alert.alert("✅ Kaydedildi",`${role==="dietitian"?(selClient?.name??"Danışan"):"Sizin"} için hedefler belirlendi.`);
  };
  const saveProg=async()=>{
    const today=new Date().toISOString().split("T")[0];const cid="me";
    const p:Prog={clientId:cid,date:today,calories:Number(pForm.calories)||wearable?.caloriesBurned||0,protein:Number(pForm.protein)||0,carbs:Number(pForm.carbs)||0,fat:Number(pForm.fat)||0,water:Number(pForm.water)||0,steps:Number(pForm.steps)||wearable?.steps||0,sleep:Number(pForm.sleep)||wearable?.sleep||0};
    setProg(p);await AsyncStorage.setItem(`${PROG_KEY}_${cid}_${today}`,JSON.stringify(p));
    Alert.alert("✅ Kaydedildi","İlerlemeniz kaydedildi.");
  };
  const pickPhoto=async()=>{
    const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync();if(status!=="granted"){Alert.alert("İzin Gerekli");return;}
    const r=await ImagePicker.launchImageLibraryAsync({allowsEditing:false,quality:0.9});
    if(!r.canceled&&r.assets[0])setPhoto(r.assets[0].uri);
  };
  const takePhoto=async()=>{
    const {status}=await ImagePicker.requestCameraPermissionsAsync();if(status!=="granted"){Alert.alert("İzin Gerekli");return;}
    const r=await ImagePicker.launchCameraAsync({allowsEditing:false,quality:0.9});
    if(!r.canceled&&r.assets[0])setPhoto(r.assets[0].uri);
  };
  const toggleItem=(item:string)=>setSelItems(p=>p.includes(item)?p.filter(i=>i!==item):[...p,item]);
  const today=new Date().toISOString().split("T")[0];
  const todayMeals=meals.filter(m=>m.date===today);
  const todayCals=todayMeals.reduce((s,m)=>s+m.calories,0);
  const getPct=(cur:number,tgt:number)=>tgt>0?Math.min((cur/tgt)*100,100):0;
  const PBar=({cur,tgt,color,label,unit}:any)=>{const p=getPct(cur,tgt);return(
    <View style={{gap:4}}>
      <View style={{flexDirection:"row",justifyContent:"space-between"}}>
        <Text style={{color:colors.foreground,fontSize:13}}>{label}</Text>
        <Text style={{color:p>=100?"#22c55e":colors.primary,fontWeight:"700",fontSize:13}}>{cur}/{tgt} {unit}</Text>
      </View>
      <View style={{height:8,backgroundColor:colors.border,borderRadius:4}}>
        <View style={{height:8,borderRadius:4,width:`${p}%`,backgroundColor:p>=100?"#22c55e":color}}/>
      </View>
      <Text style={{color:colors.muted,fontSize:11,textAlign:"right"}}>{p.toFixed(0)}%</Text>
    </View>
  );};
  const CS=()=>role==="dietitian"?(<ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={{flexDirection:"row",gap:8}}>
      {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
        style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
        <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>👤 {c.name}</Text>
      </TouchableOpacity>))}
    </View>
  </ScrollView>):null;

  return(<ScreenContainer>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      <Text style={{fontSize:22,fontWeight:"bold",color:colors.foreground}}>🥗 Beslenme Takibi</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"log",l:"➕ Öğün Ekle"},{k:"today",l:"📋 Bugün"},{k:"goals",l:"🎯 Hedefler"},{k:"progress",l:"📊 İlerleme"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
              style={{paddingHorizontal:16,paddingVertical:10,borderRadius:10,backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
              <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {tab==="log"&&(<>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
          {TYPES.map(t=>(<TouchableOpacity key={t.k} onPress={()=>setMType(t.k)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:mType===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:mType===t.k?colors.primary:colors.border}}>
            <Text style={{color:mType===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
          </TouchableOpacity>))}
        </View>
        <TouchableOpacity onPress={()=>setShowFoods(true)} style={{paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.primary,flexDirection:"row",justifyContent:"center",gap:8}}>
          <Text style={{color:colors.primary,fontWeight:"700"}}>📋 Yemek Listesinden Seç</Text>
          {selItems.length>0&&<View style={{backgroundColor:colors.primary,borderRadius:10,paddingHorizontal:8,paddingVertical:2}}><Text style={{color:"#fff",fontSize:12,fontWeight:"700"}}>{selItems.length}</Text></View>}
        </TouchableOpacity>
        {selItems.length>0&&<View style={{backgroundColor:colors.surface,borderRadius:10,padding:12,borderWidth:1,borderColor:colors.primary}}>
          <Text style={{fontWeight:"600",color:colors.foreground,marginBottom:6}}>Seçilen Yemekler:</Text>
          {selItems.map(i=>(<View key={i} style={{flexDirection:"row",justifyContent:"space-between",paddingVertical:3}}>
            <Text style={{color:colors.foreground}}>• {i}</Text>
            <TouchableOpacity onPress={()=>toggleItem(i)}><Text style={{color:"#ef4444"}}>✕</Text></TouchableOpacity>
          </View>))}
        </View>}
        <TextInput value={desc} onChangeText={setDesc} placeholder="Yemek açıklaması..." multiline placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:60,fontSize:14}}/>
        <TextInput value={cals} onChangeText={setCals} placeholder="Kalori (kcal)" keyboardType="numeric" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,fontSize:14}}/>
        <View style={{flexDirection:"row",gap:8}}>
          <TouchableOpacity onPress={pickPhoto} style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
            <Text style={{color:colors.foreground}}>🖼️ Galeriden</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
            <Text style={{color:colors.foreground}}>📷 Çek</Text>
          </TouchableOpacity>
        </View>
        {photo?<View style={{width:"100%",aspectRatio:4/3,borderRadius:12,overflow:"hidden"}}>
          <Image source={{uri:photo}} style={{width:"100%",height:"100%"}} resizeMode="cover"/>
          <TouchableOpacity onPress={()=>setPhoto("")} style={{position:"absolute",top:8,right:8,backgroundColor:"#ef4444",borderRadius:12,width:28,height:28,alignItems:"center",justifyContent:"center"}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>✕</Text>
          </TouchableOpacity>
        </View>:null}
        <TouchableOpacity onPress={saveMeal} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>💾 Öğün Kaydet</Text>
        </TouchableOpacity>
      </>)}

      {tab==="today"&&(<>
        {goals&&<View style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border}}>
          <Text style={{fontWeight:"700",color:colors.foreground,marginBottom:8}}>📊 Bugünkü Kalori</Text>
          <PBar cur={todayCals} tgt={goals.calories} color={colors.primary} label="🔥 Kalori" unit="kcal"/>
        </View>}
        {todayMeals.length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Bugün henüz öğün eklenmedi.</Text>
          :TYPES.map(type=>{const tm=todayMeals.filter(m=>m.type===type.k);if(!tm.length)return null;return(
            <View key={type.k} style={{gap:8}}>
              <Text style={{fontWeight:"700",color:colors.foreground}}>{type.l}</Text>
              {tm.map(meal=>(<View key={meal.id} style={{backgroundColor:colors.surface,borderRadius:10,padding:12,borderWidth:1,borderColor:colors.border,gap:6}}>
                <Text style={{color:colors.foreground}}>{meal.description}</Text>
                {meal.calories>0&&<Text style={{color:colors.muted,fontSize:12}}>🔥 {meal.calories} kcal</Text>}
                {meal.photoUri&&<Image source={{uri:meal.photoUri}} style={{width:"100%",aspectRatio:4/3,borderRadius:8}} resizeMode="cover"/>}
              </View>))}
            </View>
          );})}
      </>)}

      {tab==="goals"&&(<>
        <CS/>
        {role==="dietitian"?(<View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,gap:12,borderWidth:1,borderColor:colors.border}}>
          <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>👨‍⚕️ {selClient?.name??"Danışan"} için Günlük Hedef</Text>
          <Text style={{color:colors.muted,fontSize:13}}>Bu hedefler danışanın ekranında görev olarak görünecek.</Text>
          {[{k:"calories",l:"🔥 Kalori (kcal)"},{k:"protein",l:"🥩 Protein (g)"},{k:"carbs",l:"🍞 Karbonhidrat (g)"},{k:"fat",l:"🫒 Yağ (g)"},{k:"water",l:"💧 Su (ml)"},{k:"steps",l:"👟 Adım"},{k:"sleep",l:"😴 Uyku (saat)"}].map(f=>(<View key={f.k} style={{gap:4}}>
            <Text style={{fontSize:13,fontWeight:"600",color:colors.foreground}}>{f.l}</Text>
            <TextInput value={gForm[f.k as keyof typeof gForm]} onChangeText={v=>setGForm(p=>({...p,[f.k]:v}))} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background,fontSize:14}}/>
          </View>))}
          <TouchableOpacity onPress={saveGoals} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>💾 Hedefleri Belirle ve Gönder</Text>
          </TouchableOpacity>
        </View>):(<>
          {!goals?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Diyetisyeniniz henüz hedef belirlemedi.</Text>:(<>
            <View style={{backgroundColor:"#22c55e20",borderRadius:10,padding:12,borderWidth:1,borderColor:"#22c55e"}}>
              <Text style={{color:"#22c55e",fontWeight:"600"}}>✅ Diyetisyeninizin sizin için belirlediği günlük görevler</Text>
            </View>
            {[{k:"calories",l:"🔥 Kalori",v:goals.calories,u:"kcal"},{k:"protein",l:"🥩 Protein",v:goals.protein,u:"g"},{k:"carbs",l:"🍞 Karbonhidrat",v:goals.carbs,u:"g"},{k:"fat",l:"🫒 Yağ",v:goals.fat,u:"g"},{k:"water",l:"💧 Su",v:goals.water,u:"ml"},{k:"steps",l:"👟 Adım",v:goals.steps,u:"adım"},{k:"sleep",l:"😴 Uyku",v:goals.sleep,u:"saat"}].map(g=>{
              const cur=prog?prog[g.k as keyof Prog] as number:0;
              return(<View key={g.k} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border}}>
                <PBar cur={cur} tgt={g.v} color={colors.primary} label={g.l} unit={g.u}/>
              </View>);
            })}
            <TouchableOpacity onPress={()=>setTab("progress")} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>📊 İlerleme Kaydet →</Text>
            </TouchableOpacity>
          </>)}
        </>)}
      </>)}

      {tab==="progress"&&(<>
        <CS/>
        {role==="client"?(<>
          <Text style={{color:colors.muted,fontSize:13}}>Bugün ne kadar yaptığınızı girin.</Text>
          {wearable&&<View style={{backgroundColor:"#22c55e20",borderRadius:10,padding:10,borderWidth:1,borderColor:"#22c55e"}}>
            <Text style={{color:"#22c55e",fontSize:13}}>⌚ Saat: 👟 {wearable.steps} adım · 😴 {wearable.sleep} saat · 🔥 {wearable.caloriesBurned} kcal</Text>
          </View>}
          {[{k:"calories",l:"🔥 Kalori (kcal)",ph:wearable?String(wearable.caloriesBurned):"0"},{k:"protein",l:"🥩 Protein (g)",ph:"0"},{k:"carbs",l:"🍞 Karbonhidrat (g)",ph:"0"},{k:"fat",l:"🫒 Yağ (g)",ph:"0"},{k:"water",l:"💧 Su (ml)",ph:"0"},{k:"steps",l:"👟 Adım",ph:wearable?String(wearable.steps):"0"},{k:"sleep",l:"😴 Uyku (saat)",ph:wearable?String(wearable.sleep):"0"}].map(f=>(<View key={f.k} style={{gap:4}}>
            <Text style={{fontSize:13,fontWeight:"600",color:colors.foreground}}>{f.l}</Text>
            <TextInput value={pForm[f.k as keyof typeof pForm]} onChangeText={v=>setPForm(p=>({...p,[f.k]:v}))} placeholder={f.ph} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          </View>))}
          <TouchableOpacity onPress={saveProg} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>💾 İlerlemeyi Kaydet</Text>
          </TouchableOpacity>
        </>):(<>
          <Text style={{color:colors.muted,fontSize:13}}>{selClient?.name??"Danışan"}'in bugünkü ilerlemesi</Text>
          {!goals?<Text style={{color:colors.muted,textAlign:"center"}}>Bu danışan için hedef belirlenmedi.</Text>
            :!prog?<Text style={{color:colors.muted,textAlign:"center"}}>Bugün henüz ilerleme kaydedilmedi.</Text>
            :[{k:"calories",l:"🔥 Kalori",tgt:goals.calories,cur:prog.calories,u:"kcal",c:"#f97316"},{k:"water",l:"💧 Su",tgt:goals.water,cur:prog.water,u:"ml",c:"#3b82f6"},{k:"steps",l:"👟 Adım",tgt:goals.steps,cur:prog.steps,u:"adım",c:"#22c55e"},{k:"sleep",l:"😴 Uyku",tgt:goals.sleep,cur:prog.sleep,u:"saat",c:"#8b5cf6"}].map(item=>(
              <View key={item.k} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border}}>
                <PBar cur={item.cur} tgt={item.tgt} color={item.c} label={item.l} unit={item.u}/>
              </View>
            ))}
        </>)}
      </>)}
    </ScrollView>

    <Modal visible={showFoods} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:"75%"}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>📋 Yemek Seç</Text>
            <TouchableOpacity onPress={()=>setShowFoods(false)}><Text style={{color:colors.primary,fontWeight:"700",fontSize:16}}>Tamam ({selItems.length})</Text></TouchableOpacity>
          </View>
          <FlatList data={FOODS} keyExtractor={i=>i} renderItem={({item})=>{const s=selItems.includes(item);return(
            <TouchableOpacity onPress={()=>toggleItem(item)} style={{flexDirection:"row",alignItems:"center",paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border,gap:10}}>
              <View style={{width:22,height:22,borderRadius:6,borderWidth:2,borderColor:s?colors.primary:colors.border,backgroundColor:s?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>
                {s&&<Text style={{color:"#fff",fontSize:12,fontWeight:"700"}}>✓</Text>}
              </View>
              <Text style={{color:colors.foreground,fontSize:14}}>{item}</Text>
            </TouchableOpacity>);}}/>
        </View>
      </View>
    </Modal>
  </ScreenContainer>);
}
