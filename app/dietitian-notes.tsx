import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const NOTES_KEY="dietitian_notes_v2";

interface Note{id:string;clientId:string;clientName:string;title:string;content:string;category:string;createdAt:string;updatedAt:string;}

const CATEGORIES=["Genel","Beslenme","Sağlık","Hedef","Gözlem","Önemli"];
const CAT_COLORS:Record<string,string>={"Genel":"#6b7280","Beslenme":"#22c55e","Sağlık":"#ef4444","Hedef":"#3b82f6","Gözlem":"#f97316","Önemli":"#8b5cf6"};

export default function DietitianNotesScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [notes,setNotes]=useState<Note[]>([]);
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [selCat,setSelCat]=useState("Tümü");
  const [showForm,setShowForm]=useState(false);
  const [editNote,setEditNote]=useState<Note|null>(null);
  const [title,setTitle]=useState("");const [content,setContent]=useState("");const [cat,setCat]=useState("Genel");
  const [search,setSearch]=useState("");

  useEffect(()=>{load();},[]);
  const load=async()=>{
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
    const n=await AsyncStorage.getItem(NOTES_KEY);if(n)setNotes(JSON.parse(n));
  };
  const saveNotes=async(list:Note[])=>{setNotes(list);await AsyncStorage.setItem(NOTES_KEY,JSON.stringify(list));};

  const saveNote=async()=>{
    if(!title.trim()||!content.trim()){Alert.alert("Hata","Başlık ve içerik girin");return;}
    if(editNote){
      const up=notes.map(n=>n.id===editNote.id?{...n,title,content,category:cat,updatedAt:new Date().toISOString()}:n);
      await saveNotes(up);
    } else {
      if(!selClient){Alert.alert("Hata","Danışan seçin");return;}
      const note:Note={id:Date.now().toString(),clientId:selClient.id,clientName:selClient.name,title,content,category:cat,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      await saveNotes([note,...notes]);
    }
    setShowForm(false);setTitle("");setContent("");setCat("Genel");setEditNote(null);
    Alert.alert("✅ Kaydedildi");
  };

  const deleteNote=(id:string)=>Alert.alert("Sil","Bu notu silmek istiyor musunuz?",[{text:"İptal",style:"cancel"},{text:"Sil",style:"destructive",onPress:()=>saveNotes(notes.filter(n=>n.id!==id))}]);

  const openEdit=(n:Note)=>{setEditNote(n);setTitle(n.title);setContent(n.content);setCat(n.category);setShowForm(true);};

  const filtered=notes
    .filter(n=>!selClient||n.clientId===selClient.id)
    .filter(n=>selCat==="Tümü"||n.category===selCat)
    .filter(n=>!search||n.title.toLowerCase().includes(search.toLowerCase())||n.content.toLowerCase().includes(search.toLowerCase()));

  const fmt=(s:string)=>{const d=new Date(s);return`${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;};

  return(<ScreenContainer>
    <BackButton title="📝 Danışma Notları"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {/* Danışan seçimi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          <TouchableOpacity onPress={()=>setSelClient(null)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:!selClient?colors.primary:colors.surface,borderWidth:1,borderColor:!selClient?colors.primary:colors.border}}>
            <Text style={{color:!selClient?"#fff":colors.foreground,fontWeight:"600"}}>👥 Tümü</Text>
          </TouchableOpacity>
          {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
            <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>

      {/* Arama */}
      <TextInput value={search} onChangeText={setSearch} placeholder="Not ara..." placeholderTextColor={colors.muted}
        style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>

      {/* Kategori filtresi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {["Tümü",...CATEGORIES].map(c=>(
            <TouchableOpacity key={c} onPress={()=>setSelCat(c)}
              style={{paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:selCat===c?(CAT_COLORS[c]??colors.primary):colors.surface,borderWidth:1,borderColor:selCat===c?(CAT_COLORS[c]??colors.primary):colors.border}}>
              <Text style={{color:selCat===c?"#fff":colors.foreground,fontWeight:"600",fontSize:12}}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity onPress={()=>{setEditNote(null);setTitle("");setContent("");setCat("Genel");setShowForm(true);}}
        style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
        <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>+ Yeni Not</Text>
      </TouchableOpacity>

      {filtered.length===0?<Text style={{color:colors.muted,textAlign:"center",marginTop:20}}>Not bulunamadı.</Text>
        :filtered.map(n=>(
          <View key={n.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderLeftWidth:4,borderColor:colors.border,borderLeftColor:CAT_COLORS[n.category]??"#6b7280",gap:8}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start"}}>
              <View style={{flex:1,gap:4}}>
                <View style={{flexDirection:"row",alignItems:"center",gap:8}}>
                  <View style={{paddingHorizontal:8,paddingVertical:2,borderRadius:6,backgroundColor:(CAT_COLORS[n.category]??"#6b7280")+"20"}}>
                    <Text style={{fontSize:11,fontWeight:"700",color:CAT_COLORS[n.category]??"#6b7280"}}>{n.category}</Text>
                  </View>
                  <Text style={{fontSize:11,color:colors.muted}}>👤 {n.clientName}</Text>
                </View>
                <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{n.title}</Text>
              </View>
              <View style={{flexDirection:"row",gap:8,marginLeft:8}}>
                <TouchableOpacity onPress={()=>openEdit(n)}><Text style={{color:colors.primary,fontSize:13}}>Düzenle</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteNote(n.id)}><Text style={{color:"#ef4444",fontSize:13}}>Sil</Text></TouchableOpacity>
              </View>
            </View>
            <Text style={{color:colors.foreground,fontSize:14,lineHeight:22}}>{n.content}</Text>
            <Text style={{color:colors.muted,fontSize:11}}>📅 {fmt(n.createdAt)}{n.updatedAt!==n.createdAt?` · Güncellendi: ${fmt(n.updatedAt)}`:""}</Text>
          </View>
        ))}
    </ScrollView>

    <Modal visible={showForm} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14,paddingBottom:Math.max(insets.bottom+16,24)}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>{editNote?"✏️ Notu Düzenle":"📝 Yeni Not"}</Text>
            <TouchableOpacity onPress={()=>setShowForm(false)}><Text style={{color:"#ef4444",fontWeight:"600"}}>İptal</Text></TouchableOpacity>
          </View>
          {!editNote&&selClient&&<Text style={{color:colors.primary,fontWeight:"600"}}>👤 {selClient.name}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8}}>
              {CATEGORIES.map(c=>(
                <TouchableOpacity key={c} onPress={()=>setCat(c)}
                  style={{paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:cat===c?(CAT_COLORS[c]??"#6b7280"):colors.surface,borderWidth:1,borderColor:cat===c?(CAT_COLORS[c]??"#6b7280"):colors.border}}>
                  <Text style={{color:cat===c?"#fff":colors.foreground,fontWeight:"600",fontSize:12}}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TextInput value={title} onChangeText={setTitle} placeholder="Not başlığı" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,fontSize:15}}/>
          <TextInput value={content} onChangeText={setContent} placeholder="Not içeriği..." multiline placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:120,textAlignVertical:"top",fontSize:14}}/>
          <TouchableOpacity onPress={saveNote} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>💾 Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </ScreenContainer>);
}
