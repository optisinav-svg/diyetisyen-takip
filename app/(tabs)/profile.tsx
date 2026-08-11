import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Image,Modal} from "react-native";
import {useState,useEffect} from "react";
import {ScreenContainer} from "@/components/screen-container";
import {useColors} from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import * as ImagePicker from "expo-image-picker";
const SESSION_KEY="session_v3";const PHOTO_KEY="profile_photo";const THEME_KEY="app_theme";const LANG_KEY="app_lang";const RATING_KEY="my_dietitian_rating";
export default function ProfileScreen(){
  const colors=useColors();const router=useRouter();
  const [user,setUser]=useState<any>(null);const [photo,setPhoto]=useState<string|null>(null);
  const [showSettings,setShowSettings]=useState(false);const [isDark,setIsDark]=useState(false);const [lang,setLang]=useState<"tr"|"en">("tr");
  const [editMode,setEditMode]=useState(false);const [name,setName]=useState("");const [uname,setUname]=useState("");const [email,setEmail]=useState("");
  const [myRating,setMyRating]=useState(0);const [savedRating,setSavedRating]=useState(0);const [comment,setComment]=useState("");const [showRating,setShowRating]=useState(false);
  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem(SESSION_KEY);if(s){const u=JSON.parse(s);setUser(u);setName(u.name??"");setUname(u.username??"");setEmail(u.email??"");}
    const p=await AsyncStorage.getItem(PHOTO_KEY);if(p)setPhoto(p);
    const t=await AsyncStorage.getItem(THEME_KEY);if(t)setIsDark(t==="dark");
    const l=await AsyncStorage.getItem(LANG_KEY);if(l)setLang(l as "tr"|"en");
    const r=await AsyncStorage.getItem(RATING_KEY);if(r){const d=JSON.parse(r);setSavedRating(d.score??0);setMyRating(d.score??0);setComment(d.comment??"");}
  };
  const pickPhoto=async()=>{
    const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync();if(status!=="granted"){Alert.alert("İzin Gerekli");return;}
    const r=await ImagePicker.launchImageLibraryAsync({allowsEditing:true,aspect:[1,1],quality:0.8});
    if(!r.canceled&&r.assets[0]){setPhoto(r.assets[0].uri);await AsyncStorage.setItem(PHOTO_KEY,r.assets[0].uri);}
  };
  const saveProfile=async()=>{const u={...user,name,username:uname,email};setUser(u);await AsyncStorage.setItem(SESSION_KEY,JSON.stringify(u));setEditMode(false);Alert.alert("Kaydedildi ✅");};
  const saveRating=async()=>{await AsyncStorage.setItem(RATING_KEY,JSON.stringify({score:myRating,comment,date:new Date().toISOString()}));setSavedRating(myRating);setShowRating(false);Alert.alert("Teşekkürler! ⭐",`Diyetisyeninize ${myRating} yıldız verdiniz.`);};
  const deleteAccount=()=>Alert.alert("Hesabı Sil","Bu işlem geri alınamaz!",[{text:"İptal",style:"cancel"},{text:"Sil",style:"destructive",onPress:async()=>{await AsyncStorage.multiRemove([SESSION_KEY,PHOTO_KEY]);router.replace("/");}}]);
  const isDietitian=user?.role==="dietitian";
  return(<ScreenContainer>
    <ScrollView contentContainerStyle={{padding:16,gap:16,paddingBottom:40}}>
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
        <Text style={{fontSize:22,fontWeight:"bold",color:colors.foreground}}>👤 Profil ve Ayarlar</Text>
        <TouchableOpacity onPress={()=>setShowSettings(true)} style={{paddingHorizontal:14,paddingVertical:8,borderRadius:10,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:6}}>
          <Text style={{fontSize:16}}>⚙️</Text><Text style={{color:colors.foreground,fontWeight:"600",fontSize:13}}>Ayarlar</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={pickPhoto} style={{alignItems:"center",gap:8}}>
        {photo?<Image source={{uri:photo}} style={{width:100,height:100,borderRadius:50}}/>
          :<View style={{width:100,height:100,borderRadius:50,backgroundColor:colors.surface,borderWidth:2,borderColor:colors.primary,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:40}}>👤</Text></View>}
        <Text style={{color:colors.primary,fontSize:13,fontWeight:"600"}}>📷 Fotoğraf Değiştir</Text>
      </TouchableOpacity>
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,gap:12,borderWidth:1,borderColor:colors.border}}>
        {!editMode?(<>
          <Text style={{fontSize:20,fontWeight:"700",color:colors.foreground}}>{user?.name}</Text>
          <Text style={{color:colors.muted}}>@{user?.username}</Text>
          <Text style={{color:colors.muted}}>{user?.email}</Text>
          <View style={{backgroundColor:colors.primary+"20",paddingHorizontal:10,paddingVertical:4,borderRadius:8,alignSelf:"flex-start"}}>
            <Text style={{color:colors.primary,fontWeight:"600"}}>{isDietitian?"👨‍⚕️ Diyetisyen":"👤 Danışan"}</Text>
          </View>
          <TouchableOpacity onPress={()=>setEditMode(true)} style={{paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:colors.primary+"20",borderWidth:1,borderColor:colors.primary}}>
            <Text style={{color:colors.primary,fontWeight:"700"}}>✏️ Profili Düzenle</Text>
          </TouchableOpacity>
        </>):(<>
          <Text style={{fontWeight:"700",color:colors.foreground}}>✏️ Profili Düzenle</Text>
          {[{l:"Ad Soyad",v:name,s:setName},{l:"Kullanıcı Adı",v:uname,s:setUname},{l:"Email",v:email,s:setEmail}].map(f=>(
            <View key={f.l} style={{gap:4}}>
              <Text style={{fontSize:13,fontWeight:"600",color:colors.foreground}}>{f.l}</Text>
              <TextInput value={f.v} onChangeText={f.s} autoCapitalize="none" placeholderTextColor={colors.muted}
                style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background}}/>
            </View>
          ))}
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setEditMode(false)} style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.foreground}}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveProfile} style={{flex:2,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>💾 Kaydet</Text>
            </TouchableOpacity>
          </View>
        </>)}
      </View>
      {!isDietitian&&(
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:10}}>
          <Text style={{fontWeight:"700",color:colors.foreground}}>⭐ Diyetisyenime Puan Ver</Text>
          {savedRating>0&&<Text style={{color:"#22c55e"}}>✅ Mevcut puanınız: {"⭐".repeat(savedRating)}</Text>}
          <View style={{flexDirection:"row",gap:8,justifyContent:"center"}}>
            {[1,2,3,4,5].map(s=>(
              <TouchableOpacity key={s} onPress={()=>{setMyRating(s);setShowRating(true);}}>
                <Text style={{fontSize:36,opacity:s<=myRating?1:0.3}}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
          {showRating&&(<>
            <TextInput value={comment} onChangeText={setComment} placeholder="Yorum ekleyin (isteğe bağlı)" multiline placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background,minHeight:60}}/>
            <TouchableOpacity onPress={saveRating} style={{paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>Puanı Gönder</Text>
            </TouchableOpacity>
          </>)}
        </View>
      )}
      <TouchableOpacity onPress={deleteAccount} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:"#ef444420",borderWidth:1,borderColor:"#ef4444"}}>
        <Text style={{color:"#ef4444",fontWeight:"700"}}>🗑️ Hesabı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
    <Modal visible={showSettings} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>⚙️ Ayarlar</Text>
            <TouchableOpacity onPress={()=>setShowSettings(false)}><Text style={{color:"#ef4444",fontWeight:"600"}}>Kapat</Text></TouchableOpacity>
          </View>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:10}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>🎨 Tema</Text>
            <View style={{flexDirection:"row",gap:8}}>
              {[{k:false,l:"☀️ Açık Mod"},{k:true,l:"🌙 Koyu Mod"}].map(o=>(
                <TouchableOpacity key={String(o.k)} onPress={async()=>{setIsDark(o.k);await AsyncStorage.setItem(THEME_KEY,o.k?"dark":"light");}}
                  style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:isDark===o.k?colors.primary:colors.background,borderWidth:2,borderColor:isDark===o.k?colors.primary:colors.border}}>
                  <Text style={{color:isDark===o.k?"#fff":colors.foreground,fontWeight:"600"}}>{o.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.border,gap:10}}>
            <Text style={{fontWeight:"700",color:colors.foreground}}>🌍 Dil / Language</Text>
            <View style={{flexDirection:"row",gap:8}}>
              {[{k:"tr",l:"🇹🇷 Türkçe"},{k:"en",l:"🇬🇧 English"}].map(o=>(
                <TouchableOpacity key={o.k} onPress={async()=>{setLang(o.k as any);await AsyncStorage.setItem(LANG_KEY,o.k);}}
                  style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:lang===o.k?colors.primary:colors.background,borderWidth:2,borderColor:lang===o.k?colors.primary:colors.border}}>
                  <Text style={{color:lang===o.k?"#fff":colors.foreground,fontWeight:"600"}}>{o.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  </ScreenContainer>);
}
