import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const CUSTOM_KEY="custom_foods_v3";
const SESSION_KEY="session_v3";

interface FoodItem{id:string;name:string;category:string;cuisine:string;calories?:number;addedBy:"system"|"dietitian"|"client";addedByName?:string;addedByClientId?:string;groupType?:"recommendation"|"forbidden";}
interface CustomGroup{id:string;name:string;type:"recommendation"|"forbidden";items:string[];}

const CATEGORIES=["Çorba","Hamur İşi","Salata","Sulu Yemek","Tatlı","Balık","Kahvaltı","Pilav"];
const CUISINES=["Türk","İtalyan","Fransız","Japon","Kore","Orta Asya"];

const SYSTEM_FOODS:FoodItem[]=[
  // Çorba
  {id:"tc1",name:"Mercimek Çorbası",category:"Çorba",cuisine:"Türk",calories:180,addedBy:"system"},
  {id:"tc2",name:"Ezogelin Çorbası",category:"Çorba",cuisine:"Türk",calories:165,addedBy:"system"},
  {id:"tc3",name:"Domates Çorbası",category:"Çorba",cuisine:"Türk",calories:120,addedBy:"system"},
  {id:"tc4",name:"Tavuk Suyu Çorbası",category:"Çorba",cuisine:"Türk",calories:95,addedBy:"system"},
  {id:"tc5",name:"Yayla Çorbası",category:"Çorba",cuisine:"Türk",calories:140,addedBy:"system"},
  {id:"tc6",name:"Tarhana Çorbası",category:"Çorba",cuisine:"Türk",calories:155,addedBy:"system"},
  {id:"tc7",name:"Minestrone",category:"Çorba",cuisine:"İtalyan",calories:145,addedBy:"system"},
  {id:"tc8",name:"Soğan Çorbası",category:"Çorba",cuisine:"Fransız",calories:185,addedBy:"system"},
  {id:"tc9",name:"Miso Çorbası",category:"Çorba",cuisine:"Japon",calories:85,addedBy:"system"},
  {id:"tc10",name:"Ramen",category:"Çorba",cuisine:"Japon",calories:480,addedBy:"system"},
  {id:"tc11",name:"Kimchi Çorbası",category:"Çorba",cuisine:"Kore",calories:145,addedBy:"system"},
  {id:"tc12",name:"Şurpa (Et Çorbası)",category:"Çorba",cuisine:"Orta Asya",calories:280,addedBy:"system"},
  // Hamur İşi
  {id:"th1",name:"Börek (Peynirli)",category:"Hamur İşi",cuisine:"Türk",calories:320,addedBy:"system"},
  {id:"th2",name:"Simit",category:"Hamur İşi",cuisine:"Türk",calories:280,addedBy:"system"},
  {id:"th3",name:"Poğaça",category:"Hamur İşi",cuisine:"Türk",calories:290,addedBy:"system"},
  {id:"th4",name:"Gözleme (Peynirli)",category:"Hamur İşi",cuisine:"Türk",calories:350,addedBy:"system"},
  {id:"th5",name:"Lahmacun",category:"Hamur İşi",cuisine:"Türk",calories:380,addedBy:"system"},
  {id:"th6",name:"Mantı",category:"Hamur İşi",cuisine:"Türk",calories:480,addedBy:"system"},
  {id:"th7",name:"Su Böreği",category:"Hamur İşi",cuisine:"Türk",calories:390,addedBy:"system"},
  {id:"th8",name:"Pizza Margherita",category:"Hamur İşi",cuisine:"İtalyan",calories:270,addedBy:"system"},
  {id:"th9",name:"Spaghetti Bolognese",category:"Hamur İşi",cuisine:"İtalyan",calories:410,addedBy:"system"},
  {id:"th10",name:"Lasagne",category:"Hamur İşi",cuisine:"İtalyan",calories:450,addedBy:"system"},
  {id:"th11",name:"Croissant",category:"Hamur İşi",cuisine:"Fransız",calories:330,addedBy:"system"},
  {id:"th12",name:"Samsa (Et Böreği)",category:"Hamur İşi",cuisine:"Orta Asya",calories:380,addedBy:"system"},
  // Salata
  {id:"ts1",name:"Çoban Salatası",category:"Salata",cuisine:"Türk",calories:80,addedBy:"system"},
  {id:"ts2",name:"Kisir",category:"Salata",cuisine:"Türk",calories:180,addedBy:"system"},
  {id:"ts3",name:"Semizotu Salatası",category:"Salata",cuisine:"Türk",calories:75,addedBy:"system"},
  {id:"ts4",name:"Caprese Salatası",category:"Salata",cuisine:"İtalyan",calories:180,addedBy:"system"},
  {id:"ts5",name:"Niçoise Salatası",category:"Salata",cuisine:"Fransız",calories:195,addedBy:"system"},
  {id:"ts6",name:"Kimchi",category:"Salata",cuisine:"Kore",calories:22,addedBy:"system"},
  // Sulu Yemek
  {id:"tsy1",name:"Kuru Fasulye",category:"Sulu Yemek",cuisine:"Türk",calories:280,addedBy:"system"},
  {id:"tsy2",name:"Nohut Yemeği",category:"Sulu Yemek",cuisine:"Türk",calories:265,addedBy:"system"},
  {id:"tsy3",name:"İmam Bayıldı",category:"Sulu Yemek",cuisine:"Türk",calories:195,addedBy:"system"},
  {id:"tsy4",name:"Türlü",category:"Sulu Yemek",cuisine:"Türk",calories:175,addedBy:"system"},
  {id:"tsy5",name:"Bamya Yemeği",category:"Sulu Yemek",cuisine:"Türk",calories:145,addedBy:"system"},
  // Tatlı
  {id:"tt1",name:"Baklava",category:"Tatlı",cuisine:"Türk",calories:490,addedBy:"system"},
  {id:"tt2",name:"Sütlaç",category:"Tatlı",cuisine:"Türk",calories:210,addedBy:"system"},
  {id:"tt3",name:"Künefe",category:"Tatlı",cuisine:"Türk",calories:480,addedBy:"system"},
  {id:"tt4",name:"Tiramisu",category:"Tatlı",cuisine:"İtalyan",calories:380,addedBy:"system"},
  {id:"tt5",name:"Crème Brûlée",category:"Tatlı",cuisine:"Fransız",calories:340,addedBy:"system"},
  {id:"tt6",name:"Mochi",category:"Tatlı",cuisine:"Japon",calories:95,addedBy:"system"},
  // Balık
  {id:"tb1",name:"Hamsi Tava",category:"Balık",cuisine:"Türk",calories:290,addedBy:"system"},
  {id:"tb2",name:"Levrek Izgarası",category:"Balık",cuisine:"Türk",calories:220,addedBy:"system"},
  {id:"tb3",name:"Çupra Buğulama",category:"Balık",cuisine:"Türk",calories:195,addedBy:"system"},
  {id:"tb4",name:"Palamut Izgara",category:"Balık",cuisine:"Türk",calories:250,addedBy:"system"},
  {id:"tb5",name:"Sashimi",category:"Balık",cuisine:"Japon",calories:130,addedBy:"system"},
  {id:"tb6",name:"Tempura (Karides)",category:"Balık",cuisine:"Japon",calories:280,addedBy:"system"},
  // Kahvaltı
  {id:"tk1",name:"Menemen",category:"Kahvaltı",cuisine:"Türk",calories:280,addedBy:"system"},
  {id:"tk2",name:"Çılbır (Yumurta)",category:"Kahvaltı",cuisine:"Türk",calories:220,addedBy:"system"},
  {id:"tk3",name:"Sucuklu Yumurta",category:"Kahvaltı",cuisine:"Türk",calories:390,addedBy:"system"},
  {id:"tk4",name:"Bal ve Kaymak",category:"Kahvaltı",cuisine:"Türk",calories:380,addedBy:"system"},
  {id:"tk5",name:"Bruschetta",category:"Kahvaltı",cuisine:"İtalyan",calories:180,addedBy:"system"},
  {id:"tk6",name:"Pain Perdu",category:"Kahvaltı",cuisine:"Fransız",calories:290,addedBy:"system"},
  // Pilav
  {id:"tp1",name:"Bulgur Pilavı",category:"Pilav",cuisine:"Türk",calories:185,addedBy:"system"},
  {id:"tp2",name:"Pirinç Pilavı",category:"Pilav",cuisine:"Türk",calories:206,addedBy:"system"},
  {id:"tp3",name:"İç Pilav",category:"Pilav",cuisine:"Türk",calories:310,addedBy:"system"},
  {id:"tp4",name:"Plov (Özbek Pilavı)",category:"Pilav",cuisine:"Orta Asya",calories:520,addedBy:"system"},
  {id:"tp5",name:"Bibimbap",category:"Pilav",cuisine:"Kore",calories:490,addedBy:"system"},
];

export default function FoodManagementScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [myName,setMyName]=useState("Ben");
  const [myId,setMyId]=useState("me");
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [customFoods,setCustomFoods]=useState<FoodItem[]>([]);
  const [customGroups,setCustomGroups]=useState<CustomGroup[]>([]);
  const [selCategory,setSelCategory]=useState("Çorba");
  const [selCuisine,setSelCuisine]=useState("Tümü");
  const [showAddFood,setShowAddFood]=useState(false);
  const [showAddGroup,setShowAddGroup]=useState(false);
  const [newFoodName,setNewFoodName]=useState("");
  const [newFoodCals,setNewFoodCals]=useState("");
  const [newGroupName,setNewGroupName]=useState("");
  const [newGroupType,setNewGroupType]=useState<"recommendation"|"forbidden">("recommendation");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem(SESSION_KEY);
    if(s){const p=JSON.parse(s);setRole(p.role??"client");setMyName(p.name??"Ben");setMyId(p.username??"me");}
    const c=await getMyClients();setClients(c);
    const cf=await AsyncStorage.getItem(CUSTOM_KEY);if(cf)setCustomFoods(JSON.parse(cf));
  };
  const saveCustomFoods=async(list:FoodItem[])=>{setCustomFoods(list);await AsyncStorage.setItem(CUSTOM_KEY,JSON.stringify(list));};

  const addFood=async()=>{
    if(!newFoodName.trim()){Alert.alert("Hata","Yemek adı girin");return;}
    const food:FoodItem={id:Date.now().toString(),name:newFoodName.trim(),category:selCategory,cuisine:"Türk",calories:newFoodCals?Number(newFoodCals):undefined,addedBy:role,addedByName:myName,addedByClientId:role==="client"?myId:undefined};
    await saveCustomFoods([...customFoods,food]);
    setShowAddFood(false);setNewFoodName("");setNewFoodCals("");
    Alert.alert("✅ Eklendi",`"${food.name}" ${selCategory} kategorisine eklendi.`);
  };

  const addGroup=async()=>{
    if(!newGroupName.trim()){Alert.alert("Hata","Grup adı girin");return;}
    const group:CustomGroup={id:Date.now().toString(),name:newGroupName.trim(),type:newGroupType,items:[]};
    setCustomGroups(p=>[...p,group]);
    setShowAddGroup(false);setNewGroupName("");
    Alert.alert("✅ Grup Oluşturuldu",`"${group.name}" grubu (${newGroupType==="recommendation"?"Öneri":"Yasak"}) oluşturuldu.`);
  };

  const deleteCustomFood=(id:string)=>Alert.alert("Sil","Bu yemeği silmek istiyor musunuz?",[{text:"İptal",style:"cancel"},{text:"Sil",style:"destructive",onPress:()=>saveCustomFoods(customFoods.filter(f=>f.id!==id))}]);

  const allFoods=[...SYSTEM_FOODS,...customFoods];
  const catFoods=allFoods.filter(f=>f.category===selCategory&&(selCuisine==="Tümü"||f.cuisine===selCuisine));
  const dietitianFoods=catFoods.filter(f=>f.addedBy==="system"||f.addedBy==="dietitian");
  const clientFoods=catFoods.filter(f=>f.addedBy==="client");

  return(<ScreenContainer>
    <BackButton title="🍽️ Mutfak Gıdaları"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {/* Kategori seçimi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {CATEGORIES.map(c=>(<TouchableOpacity key={c} onPress={()=>setSelCategory(c)}
            style={{paddingHorizontal:16,paddingVertical:10,borderRadius:20,backgroundColor:selCategory===c?colors.primary:colors.surface,borderWidth:1,borderColor:selCategory===c?colors.primary:colors.border}}>
            <Text style={{color:selCategory===c?"#fff":colors.foreground,fontWeight:"700"}}>{c}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>

      {/* Mutfak filtresi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {["Tümü",...CUISINES].map(c=>(<TouchableOpacity key={c} onPress={()=>setSelCuisine(c)}
            style={{paddingHorizontal:12,paddingVertical:7,borderRadius:16,backgroundColor:selCuisine===c?colors.primary+"30":colors.surface,borderWidth:1,borderColor:selCuisine===c?colors.primary:colors.border}}>
            <Text style={{color:selCuisine===c?colors.primary:colors.muted,fontWeight:"600",fontSize:12}}>{c}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>

      {/* Diyetisyen ekleme butonu */}
      {role==="dietitian"&&<TouchableOpacity onPress={()=>setShowAddFood(true)}
        style={{paddingVertical:12,borderRadius:12,alignItems:"center",backgroundColor:colors.primary,flexDirection:"row",justifyContent:"center",gap:8}}>
        <Text style={{color:"#fff",fontWeight:"700"}}>+ {selCategory} Ekle</Text>
      </TouchableOpacity>}

      {/* Sistem + diyetisyen yemekleri */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,borderWidth:1,borderColor:colors.border,overflow:"hidden"}}>
        <View style={{backgroundColor:colors.primary+"20",padding:12,borderBottomWidth:1,borderBottomColor:colors.border,flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
          <Text style={{fontWeight:"700",color:colors.foreground}}>{selCategory} Listesi</Text>
          <Text style={{color:colors.muted,fontSize:12}}>{dietitianFoods.length} yemek</Text>
        </View>
        {dietitianFoods.length===0?<Text style={{padding:16,color:colors.muted}}>Bu kategoride yemek yok.</Text>
          :dietitianFoods.map((f,i)=>(<View key={f.id} style={{flexDirection:"row",alignItems:"center",padding:14,borderBottomWidth:i<dietitianFoods.length-1?1:0,borderBottomColor:colors.border}}>
            <View style={{flex:1}}>
              <Text style={{color:colors.foreground,fontWeight:"600"}}>{f.name}</Text>
              <Text style={{color:colors.muted,fontSize:11}}>{f.cuisine}{f.calories?` · 🔥 ${f.calories} kcal`:""}</Text>
            </View>
            {f.addedBy==="dietitian"&&<TouchableOpacity onPress={()=>deleteCustomFood(f.id)}><Text style={{color:"#ef4444",fontSize:12}}>Sil</Text></TouchableOpacity>}
          </View>))}
      </View>

      {/* Danışan eklemeleri */}
      {role==="client"&&<TouchableOpacity onPress={()=>setShowAddFood(true)}
        style={{paddingVertical:12,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.primary}}>
        <Text style={{color:colors.primary,fontWeight:"700"}}>+ {selCategory} Ekle</Text>
      </TouchableOpacity>}

      {clientFoods.length>0&&<View style={{backgroundColor:colors.surface,borderRadius:12,borderWidth:1,borderColor:"#ef4444",overflow:"hidden"}}>
        <View style={{backgroundColor:"#ef444420",padding:12,borderBottomWidth:1,borderBottomColor:"#ef444440"}}>
          <Text style={{fontWeight:"700",color:"#ef4444"}}>👤 Danışan Eklemeleri</Text>
          {role==="client"&&<Text style={{color:colors.muted,fontSize:11,marginTop:2}}>Sizin ekledikleriniz diyetisyeninizde görünür</Text>}
        </View>
        {clientFoods.map((f,i)=>(<View key={f.id} style={{flexDirection:"row",alignItems:"center",padding:14,borderBottomWidth:i<clientFoods.length-1?1:0,borderBottomColor:"#ef444420"}}>
          <View style={{flex:1}}>
            <Text style={{color:"#ef4444",fontWeight:"600"}}>{f.name}</Text>
            <Text style={{color:colors.muted,fontSize:11}}>👤 {f.addedByName}{f.calories?` · 🔥 ${f.calories} kcal`:""}</Text>
          </View>
          {(role==="client"&&f.addedByClientId===myId)||role==="dietitian"?<TouchableOpacity onPress={()=>deleteCustomFood(f.id)}><Text style={{color:"#ef4444",fontSize:12}}>Sil</Text></TouchableOpacity>:null}
        </View>))}
      </View>}

      {/* Yeni Grup */}
      {role==="dietitian"&&<>
        <TouchableOpacity onPress={()=>setShowAddGroup(true)} style={{paddingVertical:12,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.primary,flexDirection:"row",justifyContent:"center",gap:8}}>
          <Text style={{color:colors.primary,fontWeight:"700"}}>🗂️ Yeni Grup Oluştur</Text>
        </TouchableOpacity>
        {customGroups.length>0&&customGroups.map(g=>(<View key={g.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:2,borderColor:g.type==="recommendation"?"#22c55e":"#ef4444"}}>
          <View style={{flexDirection:"row",alignItems:"center",gap:8}}>
            <Text style={{fontSize:20}}>{g.type==="recommendation"?"💡":"🚫"}</Text>
            <Text style={{fontWeight:"700",color:g.type==="recommendation"?"#22c55e":"#ef4444"}}>{g.name}</Text>
            <View style={{marginLeft:"auto",paddingHorizontal:10,paddingVertical:3,borderRadius:8,backgroundColor:g.type==="recommendation"?"#22c55e20":"#ef444420"}}>
              <Text style={{fontSize:11,fontWeight:"700",color:g.type==="recommendation"?"#22c55e":"#ef4444"}}>{g.type==="recommendation"?"ÖNERİ":"YASAK"}</Text>
            </View>
          </View>
        </View>))}
      </>}
    </ScrollView>

    {/* Yemek Ekle Modal */}
    <Modal visible={showAddFood} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14,paddingBottom:Math.max(insets.bottom+16,24)}}>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>+ {selCategory} Ekle</Text>
          <TextInput value={newFoodName} onChangeText={setNewFoodName} placeholder="Yemek adı" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <TextInput value={newFoodCals} onChangeText={setNewFoodCals} placeholder="Kalori (kcal, isteğe bağlı)" keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setShowAddFood(false)} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.foreground}}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addFood} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>✅ Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Grup Oluştur Modal */}
    <Modal visible={showAddGroup} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14,paddingBottom:Math.max(insets.bottom+16,24)}}>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>🗂️ Yeni Grup Oluştur</Text>
          <TextInput value={newGroupName} onChangeText={setNewGroupName} placeholder="Grup adı (örn: Karbonhidrattan Kaçın)" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
          <View style={{flexDirection:"row",gap:10}}>
            {[{k:"recommendation",l:"💡 Öneri",c:"#22c55e"},{k:"forbidden",l:"🚫 Yasak",c:"#ef4444"}].map(t=>(
              <TouchableOpacity key={t.k} onPress={()=>setNewGroupType(t.k as any)} style={{flex:1,paddingVertical:12,borderRadius:12,alignItems:"center",backgroundColor:newGroupType===t.k?t.c+"20":colors.surface,borderWidth:2,borderColor:newGroupType===t.k?t.c:colors.border}}>
                <Text style={{color:newGroupType===t.k?t.c:colors.foreground,fontWeight:"700"}}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setShowAddGroup(false)} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.foreground}}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addGroup} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>✅ Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </ScreenContainer>);
}
