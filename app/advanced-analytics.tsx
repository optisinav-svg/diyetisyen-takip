import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal,Platform} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const GOALS_KEY="analytics_goals_v2";const PROG_KEY="analytics_progress_v2";
const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

interface Goal{id:string;clientId:string;clientName:string;type:string;label:string;unit:string;target:number;icon:string;startDate:string;endDate:string;repeatsDaily:boolean;}
interface Prog{goalId:string;date:string;value:number;completed:boolean;}

const GOAL_TYPES=[
  {type:"protein",label:"Protein",unit:"gram",icon:"🥩",repeatsDaily:false},
  {type:"water",label:"Su",unit:"ml",icon:"💧",repeatsDaily:true},
  {type:"steps",label:"Adım",unit:"adım",icon:"👟",repeatsDaily:true},
  {type:"sleep",label:"Uyku",unit:"saat",icon:"😴",repeatsDaily:false},
  {type:"weight",label:"Kilo",unit:"kg",icon:"⚖️",repeatsDaily:false},
  {type:"calories",label:"Kalori",unit:"kcal",icon:"🔥",repeatsDaily:false},
];

function fd(d:Date){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function dd(s:string){const d=new Date(s+"T00:00:00");return`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;}

export default function AdvancedAnalytics(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [goals,setGoals]=useState<Goal[]>([]);const [progs,setProgs]=useState<Prog[]>([]);
  const [clients,setClients]=useState<ClientRecord[]>([]);const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [tab,setTab]=useState<"goals"|"progress">("goals");
  const [showForm,setShowForm]=useState(false);
  const [selType,setSelType]=useState(GOAL_TYPES[0]);
  const [targetVal,setTargetVal]=useState("");
  const [startDate,setStartDate]=useState(new Date());const [endDate,setEndDate]=useState(new Date(Date.now()+7*86400000));
  const [showStartPicker,setShowStartPicker]=useState(false);const [showEndPicker,setShowEndPicker]=useState(false);
  const [progVals,setProgVals]=useState<Record<string,string>>({});

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const g=await AsyncStorage.getItem(GOALS_KEY);if(g)setGoals(JSON.parse(g));
    const p=await AsyncStorage.getItem(PROG_KEY);if(p)setProgs(JSON.parse(p));
  };
  const saveGoals=async(list:Goal[])=>{setGoals(list);await AsyncStorage.setItem(GOALS_KEY,JSON.stringify(list));};
  const saveProgs=async(list:Prog[])=>{setProgs(list);await AsyncStorage.setItem(PROG_KEY,JSON.stringify(list));};

  const addGoal=async()=>{
    if(!targetVal||isNaN(Number(targetVal))){Alert.alert("Hata","Geçerli hedef değeri girin");return;}
    if(!selClient&&role==="dietitian"){Alert.alert("Hata","Danışan seçin");return;}
    const g:Goal={id:Date.now().toString(),clientId:role==="dietitian"?selClient!.id:"me",clientName:role==="dietitian"?selClient!.name:"Ben",...selType,target:Number(targetVal),startDate:fd(startDate),endDate:fd(endDate)};
    await saveGoals([...goals,g]);setTargetVal("");setShowForm(false);
    Alert.alert("✅ Hedef Eklendi",`${g.clientName} için ${g.label} hedefi oluşturuldu.`);
  };
  const logProg=async(goalId:string,completed=false)=>{
    const val=progVals[goalId];const today=fd(new Date());
    const goal=goals.find(g=>g.id===goalId);if(!goal)return;
    const entry:Prog={goalId,date:today,value:Number(val)||goal.target,completed:completed||Number(val)>=goal.target};
    const up=[...progs.filter(p=>!(p.goalId===goalId&&p.date===today)),entry];
    await saveProgs(up);setProgVals(p=>({...p,[goalId]:""}));
    Alert.alert(entry.completed?"✅ Tamamlandı!":"Kaydedildi",`${goal.label} kaydedildi.`);
  };
  const delGoal=async(id:string)=>Alert.alert("Sil","Bu hedefi silmek istiyor musunuz?",[{text:"İptal",style:"cancel"},{text:"Sil",style:"destructive",onPress:()=>saveGoals(goals.filter(g=>g.id!==id))}]);

  const today=fd(new Date());
  const cid=role==="dietitian"?selClient?.id??"":"me";
  const clientGoals=goals.filter(g=>g.clientId===cid);
  const todayProg=(gid:string)=>progs.find(p=>p.goalId===gid&&p.date===today);

  return(<ScreenContainer>
    <BackButton title="📊 Hedef & İlerleme"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      <View style={{flexDirection:"row",gap:8}}>
        {(["goals","progress"] as const).map(t=>(
          <TouchableOpacity key={t} onPress={()=>setTab(t)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:tab===t?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t?colors.primary:colors.border}}>
            <Text style={{color:tab===t?"#fff":colors.foreground,fontWeight:"600"}}>{t==="goals"?"🎯 Hedefler":"📈 İlerleme"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
            <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>}

      {tab==="goals"&&(<>
        {role==="dietitian"&&<TouchableOpacity onPress={()=>setShowForm(!showForm)}
          style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700"}}>+ Hedef Ekle</Text>
        </TouchableOpacity>}

        {showForm&&role==="dietitian"&&<View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,gap:14,borderWidth:1,borderColor:colors.border}}>
          <Text style={{fontWeight:"700",color:colors.foreground,fontSize:16}}>{selClient?.name} için Hedef</Text>
          <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
            {GOAL_TYPES.map(gt=>(<TouchableOpacity key={gt.type} onPress={()=>setSelType(gt)}
              style={{paddingHorizontal:12,paddingVertical:8,borderRadius:16,backgroundColor:selType.type===gt.type?colors.primary:colors.surface,borderWidth:1,borderColor:selType.type===gt.type?colors.primary:colors.border}}>
              <Text style={{color:selType.type===gt.type?"#fff":colors.foreground,fontWeight:"600"}}>{gt.icon} {gt.label}</Text>
            </TouchableOpacity>))}
          </View>
          {selType.repeatsDaily&&<View style={{backgroundColor:"#22c55e20",borderRadius:8,padding:8,borderWidth:1,borderColor:"#22c55e"}}>
            <Text style={{color:"#22c55e",fontSize:12}}>🔄 Bu hedef her gün tekrarlanır</Text>
          </View>}
          <TextInput value={targetVal} onChangeText={setTargetVal} placeholder={`${selType.label} hedefi (${selType.unit})`} keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background,fontSize:14}}/>
          <View style={{gap:6}}>
            <Text style={{fontWeight:"600",color:colors.foreground}}>📅 Başlangıç Tarihi</Text>
            <TouchableOpacity onPress={()=>setShowStartPicker(true)}
              style={{borderWidth:1,borderColor:colors.primary,borderRadius:10,padding:12,backgroundColor:colors.surface,flexDirection:"row",alignItems:"center",gap:8}}>
              <Text style={{fontSize:18}}>📅</Text><Text style={{color:colors.foreground,fontWeight:"600"}}>{dd(fd(startDate))}</Text>
            </TouchableOpacity>
            {showStartPicker&&<DateTimePicker value={startDate} mode="date" display={Platform.OS==="ios"?"spinner":"default"} onChange={(_,d)=>{setShowStartPicker(false);if(d)setStartDate(d);}}/>}
          </View>
          <View style={{gap:6}}>
            <Text style={{fontWeight:"600",color:colors.foreground}}>📅 Bitiş Tarihi</Text>
            <TouchableOpacity onPress={()=>setShowEndPicker(true)}
              style={{borderWidth:1,borderColor:colors.primary,borderRadius:10,padding:12,backgroundColor:colors.surface,flexDirection:"row",alignItems:"center",gap:8}}>
              <Text style={{fontSize:18}}>📅</Text><Text style={{color:colors.foreground,fontWeight:"600"}}>{dd(fd(endDate))}</Text>
            </TouchableOpacity>
            {showEndPicker&&<DateTimePicker value={endDate} mode="date" minimumDate={startDate} display={Platform.OS==="ios"?"spinner":"default"} onChange={(_,d)=>{setShowEndPicker(false);if(d)setEndDate(d);}}/>}
          </View>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setShowForm(false)} style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.foreground}}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addGoal} style={{flex:2,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>Hedef Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>}

        {clientGoals.length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>{role==="dietitian"?"Henüz hedef yok.":"Diyetisyeniniz henüz hedef eklemedi."}</Text>
          :clientGoals.map(goal=>{const tp=todayProg(goal.id);const pct=tp?Math.min((tp.value/goal.target)*100,100):0;return(
            <View key={goal.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:16,gap:8,borderWidth:2,borderColor:tp?.completed?"#22c55e":colors.border}}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                <View>
                  <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{goal.icon} {goal.label}</Text>
                  <Text style={{color:colors.primary,fontWeight:"700"}}>Hedef: {goal.target} {goal.unit}</Text>
                </View>
                <View style={{alignItems:"flex-end",gap:4}}>
                  {goal.repeatsDaily&&<Text style={{color:"#22c55e",fontSize:11}}>🔄 Günlük</Text>}
                  <Text style={{color:colors.muted,fontSize:11}}>{dd(goal.startDate)} — {dd(goal.endDate)}</Text>
                  {role==="dietitian"&&<TouchableOpacity onPress={()=>delGoal(goal.id)}><Text style={{color:"#ef4444",fontSize:12}}>Sil</Text></TouchableOpacity>}
                </View>
              </View>
              {tp?(<>
                <View style={{height:8,backgroundColor:colors.border,borderRadius:4}}><View style={{height:8,backgroundColor:tp.completed?"#22c55e":colors.primary,borderRadius:4,width:`${pct}%`}}/></View>
                <Text style={{color:tp.completed?"#22c55e":colors.muted,fontSize:13}}>{tp.completed?"✅ Tamamlandı!":`${tp.value} / ${goal.target} ${goal.unit} (${pct.toFixed(0)}%)`}</Text>
              </>):<Text style={{color:colors.muted,fontSize:13}}>Bugün henüz giriş yapılmadı</Text>}
            </View>
          );})}
      </>)}

      {tab==="progress"&&(<>
        <Text style={{color:colors.muted,fontSize:13}}>{role==="client"?"Bugün tamamladıklarınızı işaretleyin":`${selClient?.name??"Danışan"}'in bugünkü ilerlemesi`}</Text>
        {clientGoals.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>Henüz hedef belirlenmedi.</Text>
          :clientGoals.map(goal=>{const tp=todayProg(goal.id);return(
            <View key={goal.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,gap:10,borderWidth:2,borderColor:tp?.completed?"#22c55e":colors.border}}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15,fontWeight:"700",color:colors.foreground}}>{goal.icon} {goal.label}</Text>
                <Text style={{color:colors.primary,fontWeight:"700"}}>{goal.target} {goal.unit}</Text>
              </View>
              {tp?.completed?<View style={{backgroundColor:"#22c55e20",borderRadius:8,padding:10,borderWidth:1,borderColor:"#22c55e"}}>
                <Text style={{color:"#22c55e",fontWeight:"700",textAlign:"center"}}>✅ Tamamlandı! ({tp.value} {goal.unit})</Text>
              </View>:(<>
                <View style={{flexDirection:"row",gap:8}}>
                  <TextInput value={progVals[goal.id]??""} onChangeText={v=>setProgVals(p=>({...p,[goal.id]:v}))} placeholder={`${goal.label} değeri (${goal.unit})`} keyboardType="numeric" placeholderTextColor={colors.muted}
                    style={{flex:1,borderWidth:1,borderColor:colors.border,borderRadius:10,padding:10,color:colors.foreground,backgroundColor:colors.background,fontSize:14}}/>
                  <TouchableOpacity onPress={()=>logProg(goal.id)} style={{paddingHorizontal:14,borderRadius:10,backgroundColor:colors.primary,justifyContent:"center"}}>
                    <Text style={{color:"#fff",fontWeight:"700"}}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={()=>logProg(goal.id,true)} style={{paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:"#22c55e20",borderWidth:1,borderColor:"#22c55e"}}>
                  <Text style={{color:"#22c55e",fontWeight:"700"}}>✅ Tamamlandı İşaretle</Text>
                </TouchableOpacity>
              </>)}
            </View>
          );})}
      </>)}
    </ScrollView>
  </ScreenContainer>);
}
