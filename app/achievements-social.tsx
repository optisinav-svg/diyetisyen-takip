import {ScrollView,Text,View,TouchableOpacity} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const BADGES_KEY="badges_v2";

const ALL_BADGES=[
  {id:"water7",icon:"💧",title:"Su Şampiyonu",desc:"7 gün su hedefini tut",points:100,category:"Su"},
  {id:"steps10k",icon:"👟",title:"Adım Ustası",desc:"10.000 adım hedefini 5 gün tut",points:150,category:"Aktivite"},
  {id:"meal_star",icon:"🥗",title:"Beslenme Yıldızı",desc:"7 gün tüm öğünleri plana göre tüket",points:200,category:"Beslenme"},
  {id:"sleep7",icon:"😴",title:"Uyku Kalitesi",desc:"7 gece 7+ saat uyu",points:120,category:"Uyku"},
  {id:"calorie",icon:"🔥",title:"Kalori Dengesi",desc:"Haftalık kalori hedefini tut",points:150,category:"Beslenme"},
  {id:"streak7",icon:"🏅",title:"7 Günlük Seri",desc:"7 gün üst üste giriş yap",points:100,category:"Genel"},
  {id:"streak30",icon:"🥇",title:"30 Günlük Seri",desc:"30 gün üst üste giriş yap",points:500,category:"Genel"},
  {id:"protein",icon:"🥩",title:"Protein Koçu",desc:"5 gün protein hedefini tut",points:120,category:"Beslenme"},
  {id:"first_meal",icon:"🍽️",title:"İlk Öğün",desc:"İlk öğününü ekle",points:50,category:"Beslenme"},
  {id:"wearable",icon:"⌚",title:"Teknoloji Dostu",desc:"Akıllı saatini bağla",points:80,category:"Genel"},
  {id:"goal5",icon:"🎯",title:"Hedef Avcısı",desc:"5 hedef tamamla",points:200,category:"Hedef"},
  {id:"omega",icon:"🐟",title:"Omega-3 Uzmanı",desc:"1 hafta omega-3 hedefini tut",points:130,category:"Besin"},
];

const CAT_COLORS:Record<string,string>={Su:"#3b82f6",Aktivite:"#22c55e",Beslenme:"#f97316",Uyku:"#8b5cf6",Genel:"#6b7280",Hedef:"#ef4444",Besin:"#06b6d4"};

export default function AchievementsSocialScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [earnedIds,setEarnedIds]=useState<string[]>([]);
  const [filter,setFilter]=useState("Tümü");
  const CATS=["Tümü","Beslenme","Aktivite","Su","Uyku","Hedef","Genel","Besin"];

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const b=await AsyncStorage.getItem(BADGES_KEY);
    if(b){const parsed=JSON.parse(b);setEarnedIds(parsed.filter((x:any)=>x.active).map((x:any)=>x.id));}
  };

  const earned=ALL_BADGES.filter(b=>earnedIds.includes(b.id));
  const notEarned=ALL_BADGES.filter(b=>!earnedIds.includes(b.id));
  const totalPoints=earned.reduce((s,b)=>s+b.points,0);
  const filtered=(badges:typeof ALL_BADGES)=>filter==="Tümü"?badges:badges.filter(b=>b.category===filter);

  return(<ScreenContainer>
    <BackButton title="🏆 Başarı Rozetleri"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {/* Özet */}
      <View style={{backgroundColor:"#FFD70020",borderRadius:14,padding:16,borderWidth:2,borderColor:"#FFD700",flexDirection:"row",justifyContent:"space-around"}}>
        <View style={{alignItems:"center",gap:4}}>
          <Text style={{fontSize:36,fontWeight:"bold",color:"#FFD700"}}>{earned.length}</Text>
          <Text style={{color:colors.muted,fontSize:12}}>Kazanılan Rozet</Text>
        </View>
        <View style={{width:1,backgroundColor:"#FFD70040"}}/>
        <View style={{alignItems:"center",gap:4}}>
          <Text style={{fontSize:36,fontWeight:"bold",color:"#FFD700"}}>{totalPoints}</Text>
          <Text style={{color:colors.muted,fontSize:12}}>Toplam Puan</Text>
        </View>
        <View style={{width:1,backgroundColor:"#FFD70040"}}/>
        <View style={{alignItems:"center",gap:4}}>
          <Text style={{fontSize:36,fontWeight:"bold",color:colors.muted}}>{notEarned.length}</Text>
          <Text style={{color:colors.muted,fontSize:12}}>Kalan Rozet</Text>
        </View>
      </View>

      {/* Kategori filtresi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {CATS.map(c=>(<TouchableOpacity key={c} onPress={()=>setFilter(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:filter===c?colors.primary:colors.surface,borderWidth:1,borderColor:filter===c?colors.primary:colors.border}}>
            <Text style={{color:filter===c?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{c}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>

      {/* Kazanılan Rozetler */}
      {filtered(earned).length>0&&(<>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>🏆 Kazanılan Rozetler ({filtered(earned).length})</Text>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
          {filtered(earned).map(b=>(
            <View key={b.id} style={{width:"47%",backgroundColor:"#FFD70020",borderRadius:12,padding:14,borderWidth:2,borderColor:"#FFD700",alignItems:"center",gap:6}}>
              <Text style={{fontSize:40}}>{b.icon}</Text>
              <Text style={{fontWeight:"700",color:colors.foreground,textAlign:"center",fontSize:13}}>{b.title}</Text>
              <Text style={{color:colors.muted,fontSize:11,textAlign:"center"}}>{b.desc}</Text>
              <View style={{backgroundColor:"#FFD70030",paddingHorizontal:10,paddingVertical:3,borderRadius:8}}>
                <Text style={{color:"#B8860B",fontWeight:"700",fontSize:12}}>⭐ {b.points} puan</Text>
              </View>
              <View style={{backgroundColor:CAT_COLORS[b.category]+"20",paddingHorizontal:8,paddingVertical:2,borderRadius:6}}>
                <Text style={{fontSize:10,fontWeight:"600",color:CAT_COLORS[b.category]}}>{b.category}</Text>
              </View>
            </View>
          ))}
        </View>
      </>)}

      {/* Kazanılmamış Rozetler */}
      {filtered(notEarned).length>0&&(<>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>🔒 Kazanılacak Rozetler ({filtered(notEarned).length})</Text>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
          {filtered(notEarned).map(b=>(
            <View key={b.id} style={{width:"47%",backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,alignItems:"center",gap:6,opacity:0.6}}>
              <Text style={{fontSize:40,opacity:0.4}}>{b.icon}</Text>
              <Text style={{fontWeight:"700",color:colors.foreground,textAlign:"center",fontSize:13}}>{b.title}</Text>
              <Text style={{color:colors.muted,fontSize:11,textAlign:"center"}}>{b.desc}</Text>
              <View style={{backgroundColor:colors.border,paddingHorizontal:10,paddingVertical:3,borderRadius:8}}>
                <Text style={{color:colors.muted,fontWeight:"600",fontSize:12}}>⭐ {b.points} puan</Text>
              </View>
              <View style={{backgroundColor:CAT_COLORS[b.category]+"20",paddingHorizontal:8,paddingVertical:2,borderRadius:6}}>
                <Text style={{fontSize:10,fontWeight:"600",color:CAT_COLORS[b.category]}}>{b.category}</Text>
              </View>
            </View>
          ))}
        </View>
      </>)}
    </ScrollView>
  </ScreenContainer>);
}
