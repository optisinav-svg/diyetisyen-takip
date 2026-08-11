import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,ActivityIndicator} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useRouter} from "expo-router";
import {useEffect,useState} from "react";
import {useColors} from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
const USERS_KEY="reg_users_v3";const SESSION_KEY="session_v3";const REMEMBER_KEY="remember_v3";
function genCode(){return Math.floor(100000+Math.random()*900000).toString();}
type Screen="loading"|"login"|"register"|"verify";
export default function AuthScreen(){
  const router=useRouter();const colors=useColors();
  const [screen,setScreen]=useState<Screen>("loading");
  const [lu,setLu]=useState("");const [lp,setLp]=useState("");const [remMe,setRemMe]=useState(false);const [pfilled,setPfilled]=useState(false);const [showPw,setShowPw]=useState(false);
  const [re,setRe]=useState("");const [ru,setRu]=useState("");const [rp,setRp]=useState("");const [role,setRole]=useState<"dietitian"|"client">("client");
  const [code,setCode]=useState("");const [sent,setSent]=useState("");const [pending,setPending]=useState<any>(null);
  useEffect(()=>{init();},[]);
  const init=async()=>{
    const s=await AsyncStorage.getItem(SESSION_KEY);if(s){router.replace("/features-menu");return;}
    const r=await AsyncStorage.getItem(REMEMBER_KEY);if(r){const d=JSON.parse(r);setLu(d.username);setLp(d.password);setRemMe(true);setPfilled(true);}
    setScreen("login");
  };
  const getUsers=async()=>{const d=await AsyncStorage.getItem(USERS_KEY);return d?JSON.parse(d):[];};
  const login=async()=>{
    if(!lu.trim()||!lp.trim()){Alert.alert("Hata","Kullanıcı adı ve şifre girin");return;}
    const users=await getUsers();const user=users.find((u:any)=>u.username===lu.trim()&&u.password===lp);
    if(!user){Alert.alert("Hata","Kullanıcı adı veya şifre hatalı");return;}
    if(!user.emailVerified){Alert.alert("Hata","Email adresinizi doğrulayın");return;}
    await AsyncStorage.setItem(SESSION_KEY,JSON.stringify({username:user.username,role:user.role,name:user.name,email:user.email}));
    if(remMe)await AsyncStorage.setItem(REMEMBER_KEY,JSON.stringify({username:user.username,password:user.password}));
    else await AsyncStorage.removeItem(REMEMBER_KEY);
    router.replace("/features-menu");
  };
  const register=async()=>{
    if(!re.trim()||!ru.trim()||!rp.trim()){Alert.alert("Hata","Tüm alanları doldurun");return;}
    if(!re.includes("@")){Alert.alert("Hata","Geçerli email girin");return;}
    if(rp.length<6){Alert.alert("Hata","Şifre en az 6 karakter");return;}
    const users=await getUsers();
    if(users.find((u:any)=>u.username===ru.trim())){Alert.alert("Hata","Bu kullanıcı adı zaten kullanılıyor");return;}
    if(users.find((u:any)=>u.email===re.trim())){Alert.alert("Hata","Bu email zaten kayıtlı");return;}
    const c=genCode();setSent(c);setPending({name:ru.trim(),username:ru.trim(),email:re.trim(),password:rp,role,registeredAt:new Date().toISOString(),biometricEnabled:false,emailVerified:false});
    setScreen("verify");Alert.alert("📧 Doğrulama Kodu",`${re} adresine kod gönderildi.\n\nTest kodu: ${c}`);
  };
  const verify=async()=>{
    if(code.trim()!==sent){Alert.alert("Hata","Kod hatalı");return;}
    const users=await getUsers();const user={...pending,emailVerified:true};
    await AsyncStorage.setItem(USERS_KEY,JSON.stringify([...users,user]));
    await AsyncStorage.setItem(SESSION_KEY,JSON.stringify({username:user.username,role:user.role,name:user.name,email:user.email}));
    Alert.alert("✅ Hesap Oluşturuldu!");router.replace("/features-menu");
  };
  if(screen==="loading")return(<ScreenContainer><View style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator size="large"/></View></ScreenContainer>);
  if(screen==="verify")return(
    <ScreenContainer><ScrollView contentContainerStyle={{padding:24,gap:20,paddingBottom:40}}>
      <View style={{alignItems:"center",gap:8,marginTop:40}}>
        <Text style={{fontSize:48}}>📧</Text>
        <Text style={{fontSize:24,fontWeight:"bold",color:colors.foreground}}>Email Doğrulama</Text>
        <Text style={{color:colors.muted,textAlign:"center"}}>{pending?.email} adresine gönderilen kodu girin</Text>
      </View>
      <TextInput value={code} onChangeText={setCode} placeholder="123456" keyboardType="numeric" maxLength={6} placeholderTextColor={colors.muted}
        style={{borderWidth:2,borderColor:colors.primary,borderRadius:12,padding:16,color:colors.foreground,backgroundColor:colors.surface,fontSize:28,textAlign:"center",letterSpacing:8}}/>
      <TouchableOpacity onPress={verify} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
        <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>✅ Doğrula ve Devam Et</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>{const c=genCode();setSent(c);Alert.alert("Kod",`Yeni kod: ${c}`);}} style={{alignItems:"center"}}>
        <Text style={{color:colors.primary}}>Kod gelmedi? <Text style={{fontWeight:"700"}}>Tekrar Gönder</Text></Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setScreen("register")} style={{alignItems:"center"}}>
        <Text style={{color:colors.muted}}>← Geri dön</Text>
      </TouchableOpacity>
    </ScrollView></ScreenContainer>
  );
  if(screen==="register")return(
    <ScreenContainer><ScrollView contentContainerStyle={{padding:24,gap:16,paddingBottom:40}}>
      <View style={{alignItems:"center",gap:6,marginBottom:8,marginTop:20}}>
        <Text style={{fontSize:32,fontWeight:"bold",color:colors.foreground}}>🥗 Kayıt Ol</Text>
        <Text style={{color:colors.muted}}>Yeni hesap oluşturun</Text>
      </View>
      <View style={{gap:6}}><Text style={{fontWeight:"600",color:colors.foreground}}>📧 Email</Text>
        <TextInput value={re} onChangeText={setRe} placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,color:colors.foreground,backgroundColor:colors.surface}}/>
      </View>
      <View style={{gap:6}}><Text style={{fontWeight:"600",color:colors.foreground}}>👤 Kullanıcı Adı</Text>
        <TextInput value={ru} onChangeText={setRu} placeholder="kullanici_adi" autoCapitalize="none" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,color:colors.foreground,backgroundColor:colors.surface}}/>
        <Text style={{color:colors.muted,fontSize:12}}>Aynı kullanıcı adı tekrar kullanılamaz</Text>
      </View>
      <View style={{gap:6}}><Text style={{fontWeight:"600",color:colors.foreground}}>🔒 Şifre (min 6 karakter)</Text>
        <TextInput value={rp} onChangeText={setRp} placeholder="••••••" secureTextEntry autoCapitalize="none" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,color:colors.foreground,backgroundColor:colors.surface}}/>
      </View>
      <View style={{gap:6}}><Text style={{fontWeight:"600",color:colors.foreground}}>Rolünüz</Text>
        <View style={{flexDirection:"row",gap:10}}>
          {(["client","dietitian"] as const).map(r=>(
            <TouchableOpacity key={r} onPress={()=>setRole(r)} style={{flex:1,paddingVertical:14,borderRadius:10,alignItems:"center",backgroundColor:role===r?colors.primary:colors.surface,borderWidth:2,borderColor:role===r?colors.primary:colors.border}}>
              <Text style={{color:role===r?"#fff":colors.foreground,fontWeight:"700"}}>{r==="client"?"👤 Danışan":"👨‍⚕️ Diyetisyen"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity onPress={register} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary,marginTop:8}}>
        <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>Kayıt Ol →</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setScreen("login")} style={{alignItems:"center"}}>
        <Text style={{color:colors.primary}}>Hesabınız var mı? <Text style={{fontWeight:"700"}}>Giriş yapın</Text></Text>
      </TouchableOpacity>
    </ScrollView></ScreenContainer>
  );
  return(
    <ScreenContainer><ScrollView contentContainerStyle={{padding:24,gap:16,paddingBottom:40}}>
      <View style={{alignItems:"center",gap:6,marginBottom:16,marginTop:40}}>
        <Text style={{fontSize:48}}>🥗</Text>
        <Text style={{fontSize:28,fontWeight:"bold",color:colors.foreground}}>Diyetisyen Takip</Text>
        <Text style={{color:colors.muted}}>Hesabınıza giriş yapın</Text>
      </View>
      <View style={{gap:6}}><Text style={{fontWeight:"600",color:colors.foreground}}>👤 Kullanıcı Adı</Text>
        <TextInput value={lu} onChangeText={v=>{setLu(v);setPfilled(false);}} placeholder="kullanici_adi" autoCapitalize="none" placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,color:colors.foreground,backgroundColor:colors.surface,fontSize:15}}/>
      </View>
      <View style={{gap:6}}><Text style={{fontWeight:"600",color:colors.foreground}}>🔒 Şifre</Text>
        <View>
          <TextInput value={lp} onChangeText={v=>{setLp(v);setPfilled(false);}} secureTextEntry={!showPw} placeholder="••••••••" placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,paddingRight:48,color:colors.foreground,backgroundColor:colors.surface,fontSize:15}}/>
          <TouchableOpacity onPress={()=>setShowPw(!showPw)} style={{position:"absolute",right:14,top:14}}>
            <Text>{showPw?"🙈":"👁️"}</Text>
          </TouchableOpacity>
        </View>
        {remMe&&pfilled&&<Text style={{color:"#22c55e",fontSize:12}}>✅ Şifreniz hatırlandı</Text>}
      </View>
      <TouchableOpacity onPress={async()=>{const v=!remMe;setRemMe(v);if(!v){setLp("");setPfilled(false);await AsyncStorage.removeItem(REMEMBER_KEY);}}}
        style={{flexDirection:"row",alignItems:"center",gap:10}}>
        <View style={{width:24,height:24,borderRadius:6,borderWidth:2,borderColor:remMe?colors.primary:colors.border,backgroundColor:remMe?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>
          {remMe&&<Text style={{color:"#fff",fontSize:14,fontWeight:"700"}}>✓</Text>}
        </View>
        <View>
          <Text style={{color:colors.foreground,fontWeight:"600"}}>Beni hatırla</Text>
          <Text style={{color:colors.muted,fontSize:12}}>{remMe?"Aktif — Şifre otomatik doldurulur":"Pasif — Her girişte şifre gerekir"}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={login} style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary,marginTop:8}}>
        <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>Giriş Yap →</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setScreen("register")} style={{alignItems:"center"}}>
        <Text style={{color:colors.primary}}>Hesabınız yok mu? <Text style={{fontWeight:"700"}}>Kayıt olun</Text></Text>
      </TouchableOpacity>
    </ScrollView></ScreenContainer>
  );
}
