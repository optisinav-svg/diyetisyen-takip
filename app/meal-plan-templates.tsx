import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const TEMPLATES_KEY="meal_templates_v3";const ASSIGNED_KEY="assigned_templates_v3";

interface MealItem{name:string;portion:string;calories:number;}
interface DayMeal{type:string;items:MealItem[];}
interface Template{id:string;name:string;category:string;icon:string;description:string;days:DayMeal[][];createdBy:"system"|"dietitian";}
interface Assigned{clientId:string;templateId:string;assignedAt:string;}

const DEF_TEMPLATES:Template[]=[
  {id:"hamile",name:"Hamile (Gebe) Diyeti",category:"Özel Durum",icon:"🤰",description:"Gebelik döneminde anne ve bebek sağlığını destekleyen beslenme planı.",createdBy:"system",days:[[
    {type:"🌅 Kahvaltı",items:[{name:"Tam tahıllı ekmek",portion:"2 dilim",calories:160},{name:"Haşlanmış yumurta",portion:"2 adet",calories:155},{name:"Peynir (az tuzlu)",portion:"60g",calories:140},{name:"Domates, salatalık",portion:"1 porsiyon",calories:30}]},
    {type:"🍎 Ara Öğün",items:[{name:"Ceviz",portion:"3 adet",calories:78},{name:"Elma",portion:"1 adet",calories:72}]},
    {type:"☀️ Öğle",items:[{name:"Mercimek çorbası",portion:"1 kase",calories:180},{name:"Tavuk ızgara",portion:"150g",calories:165},{name:"Bulgur pilavı",portion:"4 kaşık",calories:150},{name:"Mevsim salatası",portion:"1 porsiyon",calories:45}]},
    {type:"🌙 Akşam",items:[{name:"Ispanak yemeği",portion:"1 porsiyon",calories:120},{name:"Yoğurt",portion:"200g",calories:100},{name:"Tam buğday ekmeği",portion:"1 dilim",calories:80}]},
  ]]},
  {id:"emzikli",name:"Emzikli Kadın Diyeti",category:"Özel Durum",icon:"🤱",description:"Emzirme döneminde süt üretimini destekleyen beslenme planı.",createdBy:"system",days:[[
    {type:"🌅 Kahvaltı",items:[{name:"Yulaf ezmesi (sütlü)",portion:"1 kase",calories:280},{name:"Muz",portion:"1 adet",calories:89},{name:"Badem",portion:"15 adet",calories:104}]},
    {type:"🍎 Ara Öğün",items:[{name:"Yoğurt",portion:"200g",calories:100},{name:"Ceviz",portion:"4 adet",calories:104}]},
    {type:"☀️ Öğle",items:[{name:"Somon ızgara",portion:"200g",calories:280},{name:"Bulgur pilavı",portion:"6 kaşık",calories:225},{name:"Brokoli (haşlama)",portion:"150g",calories:51}]},
    {type:"🌙 Akşam",items:[{name:"Mercimek köftesi",portion:"8 adet",calories:240},{name:"Ayran",portion:"200ml",calories:56}]},
  ]]},
  {id:"sporcu",name:"Sporcu Diyeti",category:"Performans",icon:"🏋️",description:"Yüksek performans ve kas gelişimi için optimize edilmiş beslenme planı.",createdBy:"system",days:[[
    {type:"🌅 Kahvaltı",items:[{name:"Yumurta akı omleti",portion:"4 adet",calories:68},{name:"Tam tahıllı ekmek",portion:"2 dilim",calories:160},{name:"Muz",portion:"1 adet",calories:89},{name:"Süt",portion:"250ml",calories:122}]},
    {type:"🍎 Ara Öğün",items:[{name:"Protein bar",portion:"1 adet",calories:180},{name:"Elma",portion:"1 adet",calories:72}]},
    {type:"☀️ Öğle",items:[{name:"Tavuk göğsü ızgara",portion:"200g",calories:220},{name:"Pirinç pilavı",portion:"6 kaşık",calories:210},{name:"Brokoli, havuç",portion:"150g",calories:65}]},
    {type:"🌙 Akşam",items:[{name:"Ton balığı",portion:"150g",calories:158},{name:"Tatlı patates",portion:"200g",calories:172},{name:"Yeşil salata",portion:"1 porsiyon",calories:30}]},
  ]]},
  {id:"ogrenci",name:"Sınav Dönemi (Öğrenci)",category:"Performans",icon:"📚",description:"Beyin fonksiyonlarını destekleyen, konsantrasyonu artıran beslenme planı.",createdBy:"system",days:[[
    {type:"🌅 Kahvaltı",items:[{name:"Yumurta (haşlama)",portion:"2 adet",calories:155},{name:"Ceviz",portion:"5 adet",calories:130},{name:"Yaban mersini",portion:"100g",calories:57},{name:"Tam tahıllı ekmek",portion:"1 dilim",calories:80}]},
    {type:"🍎 Ara Öğün",items:[{name:"Badem",portion:"20 adet",calories:139},{name:"Yeşil çay",portion:"1 bardak",calories:2}]},
    {type:"☀️ Öğle",items:[{name:"Somon sandviç",portion:"1 adet",calories:350},{name:"Domates çorbası",portion:"1 kase",calories:120}]},
    {type:"🌙 Akşam",items:[{name:"Mercimek çorbası",portion:"1 kase",calories:180},{name:"Peynirli omlet",portion:"1 porsiyon",calories:200},{name:"Zeytinyağlı salata",portion:"1 porsiyon",calories:90}]},
  ]]},
  {id:"koruma",name:"Koruma Diyeti",category:"Sağlık",icon:"🛡️",description:"Kilo koruma ve sağlıklı yaşam için dengeli, sürdürülebilir beslenme planı.",createdBy:"system",days:[[
    {type:"🌅 Kahvaltı",items:[{name:"Yoğurt (yağsız)",portion:"200g",calories:68},{name:"Meyve karışımı",portion:"150g",calories:90},{name:"Granola",portion:"30g",calories:120}]},
    {type:"🍎 Ara Öğün",items:[{name:"Meyve (mevsim)",portion:"1 adet",calories:70}]},
    {type:"☀️ Öğle",items:[{name:"Izgara tavuk",portion:"120g",calories:132},{name:"Bulgur pilavı",portion:"4 kaşık",calories:150},{name:"Büyük yeşil salata",portion:"1 porsiyon",calories:60}]},
    {type:"🌙 Akşam",items:[{name:"Sebze çorbası",portion:"1 kase",calories:90},{name:"Ton balıklı salata",portion:"1 porsiyon",calories:180}]},
  ]]},
  {id:"diyabet",name:"Diyabet (Şeker Hastası) Diyeti",category:"Hastalık",icon:"🩺",description:"Kan şekerini dengede tutan, düşük glisemik indeksli gıdalardan oluşan beslenme planı.",createdBy:"system",days:[[
    {type:"🌅 Kahvaltı",items:[{name:"Yulaf ezmesi (şekersiz)",portion:"50g",calories:185},{name:"Haşlanmış yumurta",portion:"2 adet",calories:155},{name:"Domates, salatalık",portion:"150g",calories:25}]},
    {type:"🍎 Ara Öğün",items:[{name:"Ceviz",portion:"3 adet",calories:78},{name:"Elma (küçük)",portion:"1 adet",calories:55}]},
    {type:"☀️ Öğle",items:[{name:"Bulgur pilavı (az)",portion:"3 kaşık",calories:112},{name:"Kuru fasulye",portion:"1 porsiyon",calories:220},{name:"Ayran",portion:"200ml",calories:56}]},
    {type:"🌙 Akşam",items:[{name:"Izgara balık",portion:"150g",calories:165},{name:"Buharda sebze",portion:"200g",calories:80},{name:"Yoğurt (az yağlı)",portion:"150g",calories:75}]},
  ]]},
];

export default function MealPlanTemplatesScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [templates,setTemplates]=useState<Template[]>(DEF_TEMPLATES);
  const [assigned,setAssigned]=useState<Assigned[]>([]);
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [selTemplate,setSelTemplate]=useState<Template|null>(null);
  const [tab,setTab]=useState<"list"|"create">("list");
  const [selCat,setSelCat]=useState("Tümü");
  const [showAssign,setShowAssign]=useState(false);
  const [assigningT,setAssigningT]=useState<Template|null>(null);
  const [assignClients,setAssignClients]=useState<string[]>([]);
  const [newName,setNewName]=useState("");const [newCat,setNewCat]=useState("Özel");const [newIcon,setNewIcon]=useState("🍽️");const [newDesc,setNewDesc]=useState("");
  const [newMeals,setNewMeals]=useState([{type:"Kahvaltı",items:""},{type:"Öğle",items:""},{type:"Akşam",items:""},{type:"Ara Öğün",items:""}]);

  const CATS=["Tümü","Özel Durum","Performans","Sağlık","Hastalık","Özel"];
  const ICONS=["🍽️","🤰","🤱","🏋️","📚","🛡️","🩺","💪","🧘","🌱","❤️","⚡"];

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);
    const t=await AsyncStorage.getItem(TEMPLATES_KEY);if(t){const custom=JSON.parse(t);setTemplates([...DEF_TEMPLATES,...custom.filter((x:Template)=>x.createdBy==="dietitian")]);}
    const a=await AsyncStorage.getItem(ASSIGNED_KEY);if(a)setAssigned(JSON.parse(a));
  };
  const createTemplate=async()=>{
    if(!newName.trim()){Alert.alert("Hata","Şablon adı girin");return;}
    const t:Template={id:Date.now().toString(),name:newName,category:newCat,icon:newIcon,description:newDesc,days:[[...newMeals.filter(m=>m.items.trim()).map(m=>({type:m.type,items:m.items.split("\n").filter(i=>i.trim()).map(l=>({name:l.trim(),portion:"1 porsiyon",calories:0}))}))]], createdBy:"dietitian"};
    const up=[...templates,t];setTemplates(up);
    const custom=up.filter(x=>x.createdBy==="dietitian");await AsyncStorage.setItem(TEMPLATES_KEY,JSON.stringify(custom));
    setTab("list");setNewName("");setNewDesc("");Alert.alert("✅ Oluşturuldu",`"${t.name}" şablonu oluşturuldu.`);
  };
  const assignTemplate=async()=>{
    if(!assigningT)return;
    const others=assigned.filter(a=>a.templateId!==assigningT.id);
    const newA=assignClients.map(cid=>({clientId:cid,templateId:assigningT.id,assignedAt:new Date().toISOString()}));
    const up=[...others,...newA];setAssigned(up);await AsyncStorage.setItem(ASSIGNED_KEY,JSON.stringify(up));
    setShowAssign(false);
    const names=clients.filter(c=>assignClients.includes(c.id)).map(c=>c.name).join(", ");
    Alert.alert("✅ Atandı",`"${assigningT.name}" → ${names}`);
  };
  const delTemplate=async(id:string)=>{
    const up=templates.filter(t=>t.id!==id);setTemplates(up);
    const custom=up.filter(x=>x.createdBy==="dietitian");await AsyncStorage.setItem(TEMPLATES_KEY,JSON.stringify(custom));
  };

  const myTemplateIds=assigned.filter(a=>a.clientId==="me").map(a=>a.templateId);
  const myTemplates=templates.filter(t=>myTemplateIds.includes(t.id));
  const filtered=selCat==="Tümü"?templates:templates.filter(t=>t.category===selCat);

  if(selTemplate){
    const total=selTemplate.days[0]?.reduce((s,m)=>s+m.items.reduce((ms,i)=>ms+i.calories,0),0)??0;
    return(<ScreenContainer>
      <BackButton title={selTemplate.name} onBack={()=>setSelTemplate(null)}/>
      <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
          <Text style={{fontSize:32,textAlign:"center"}}>{selTemplate.icon}</Text>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground,textAlign:"center"}}>{selTemplate.name}</Text>
          <Text style={{color:colors.muted,textAlign:"center",lineHeight:20}}>{selTemplate.description}</Text>
          {total>0&&<Text style={{color:colors.primary,fontWeight:"700",textAlign:"center"}}>🔥 Günlük toplam: ~{total} kcal</Text>}
        </View>
        {selTemplate.days[0]?.map((meal,i)=>(
          <View key={i} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:8}}>
            <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{meal.type}</Text>
            {meal.items.map((item,j)=>(
              <View key={j} style={{flexDirection:"row",justifyContent:"space-between",paddingVertical:4,borderBottomWidth:j<meal.items.length-1?1:0,borderBottomColor:colors.border}}>
                <Text style={{color:colors.foreground,flex:1}}>• {item.name}</Text>
                <Text style={{color:colors.muted,fontSize:13}}>{item.portion}</Text>
                {item.calories>0&&<Text style={{color:colors.primary,fontSize:12,marginLeft:8}}>{item.calories} kcal</Text>}
              </View>
            ))}
          </View>
        ))}
        {role==="dietitian"&&<TouchableOpacity onPress={()=>{setAssigningT(selTemplate);const already=assigned.filter(a=>a.templateId===selTemplate.id).map(a=>a.clientId);setAssignClients(already);setShowAssign(true);}}
          style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>👤 Danışana Ata</Text>
        </TouchableOpacity>}
      </ScrollView>
      <Modal visible={showAssign} animationType="slide" transparent>
        <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
          <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14,paddingBottom:Math.max(insets.bottom+16,24)}}>
            <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>👤 Danışana Ata: {assigningT?.name}</Text>
            {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setAssignClients(p=>p.includes(c.id)?p.filter(i=>i!==c.id):[...p,c.id])}
              style={{flexDirection:"row",alignItems:"center",gap:12,padding:14,borderRadius:12,backgroundColor:assignClients.includes(c.id)?colors.primary+"20":colors.surface,borderWidth:2,borderColor:assignClients.includes(c.id)?colors.primary:colors.border}}>
              <View style={{width:24,height:24,borderRadius:12,borderWidth:2,borderColor:assignClients.includes(c.id)?colors.primary:colors.border,backgroundColor:assignClients.includes(c.id)?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>
                {assignClients.includes(c.id)&&<Text style={{color:"#fff",fontWeight:"700"}}>✓</Text>}
              </View>
              <Text style={{fontSize:15,fontWeight:"600",color:colors.foreground}}>👤 {c.name}</Text>
            </TouchableOpacity>))}
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity onPress={()=>setShowAssign(false)} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
                <Text style={{color:colors.foreground}}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={assignTemplate} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
                <Text style={{color:"#fff",fontWeight:"700"}}>✅ Ata</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>);
  }

  return(<ScreenContainer>
    <BackButton title="📋 Öğün Plan Şablonları"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {role==="dietitian"&&<View style={{flexDirection:"row",gap:8}}>
        {[{k:"list",l:"📋 Şablonlar"},{k:"create",l:"➕ Yeni Oluştur"}].map(t=>(
          <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
            <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>}

      {(role==="client"||tab==="list")&&(<>
        {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {CATS.map(c=>(<TouchableOpacity key={c} onPress={()=>setSelCat(c)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selCat===c?colors.primary:colors.surface,borderWidth:1,borderColor:selCat===c?colors.primary:colors.border}}>
              <Text style={{color:selCat===c?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{c}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>}
        {role==="client"&&<Text style={{color:colors.muted,fontSize:13}}>Diyetisyeninizin size atadığı beslenme planları</Text>}
        {role==="client"&&myTemplates.length===0&&<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Diyetisyeniniz henüz bir plan atamadı.</Text>}
        {(role==="dietitian"?filtered:myTemplates).map(t=>{
          const ac=assigned.filter(a=>a.templateId===t.id).length;
          return(<TouchableOpacity key={t.id} onPress={()=>setSelTemplate(t)}
            style={{backgroundColor:colors.surface,borderRadius:14,padding:16,gap:8,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:12}}>
            <Text style={{fontSize:36}}>{t.icon}</Text>
            <View style={{flex:1}}>
              <Text style={{fontSize:15,fontWeight:"700",color:colors.foreground}}>{t.name}</Text>
              <Text style={{color:colors.muted,fontSize:12}}>{t.category}</Text>
              <Text style={{color:colors.muted,fontSize:12}} numberOfLines={2}>{t.description}</Text>
              {role==="dietitian"&&ac>0&&<Text style={{color:colors.primary,fontSize:11,marginTop:2}}>✅ {ac} danışana atandı</Text>}
              {t.createdBy==="dietitian"&&<Text style={{color:"#f97316",fontSize:11}}>✏️ Sizin oluşturduğunuz</Text>}
            </View>
            <View style={{gap:6,alignItems:"flex-end"}}>
              <Text style={{color:colors.primary,fontWeight:"600"}}>→</Text>
              {role==="dietitian"&&t.createdBy==="dietitian"&&<TouchableOpacity onPress={()=>delTemplate(t.id)}><Text style={{color:"#ef4444",fontSize:12}}>Sil</Text></TouchableOpacity>}
            </View>
          </TouchableOpacity>);
        })}
      </>)}

      {role==="dietitian"&&tab==="create"&&(<View style={{gap:14}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {ICONS.map(ic=>(<TouchableOpacity key={ic} onPress={()=>setNewIcon(ic)}
              style={{width:44,height:44,borderRadius:22,alignItems:"center",justifyContent:"center",backgroundColor:newIcon===ic?colors.primary+"30":colors.surface,borderWidth:2,borderColor:newIcon===ic?colors.primary:colors.border}}>
              <Text style={{fontSize:22}}>{ic}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>
        <TextInput value={newName} onChangeText={setNewName} placeholder="Şablon adı" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {CATS.filter(c=>c!=="Tümü").map(c=>(<TouchableOpacity key={c} onPress={()=>setNewCat(c)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:newCat===c?colors.primary:colors.surface,borderWidth:1,borderColor:newCat===c?colors.primary:colors.border}}>
              <Text style={{color:newCat===c?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{c}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>
        <TextInput value={newDesc} onChangeText={setNewDesc} placeholder="Açıklama" multiline placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:60}}/>
        {newMeals.map((meal,i)=>(<View key={meal.type} style={{gap:6}}>
          <Text style={{fontWeight:"600",color:colors.foreground}}>{meal.type==="Kahvaltı"?"🌅":meal.type==="Öğle"?"☀️":meal.type==="Akşam"?"🌙":"🍎"} {meal.type} İçeriği</Text>
          <TextInput value={meal.items} onChangeText={v=>setNewMeals(p=>p.map((m,j)=>j===i?{...m,items:v}:m))} placeholder={`Her satıra bir yemek:\nYulaf ezmesi\nHaşlanmış yumurta`} multiline placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:80,textAlignVertical:"top"}}/>
        </View>))}
        <TouchableOpacity onPress={createTemplate} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
          <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>✅ Şablon Oluştur</Text>
        </TouchableOpacity>
      </View>)}
    </ScrollView>
  </ScreenContainer>);
}
