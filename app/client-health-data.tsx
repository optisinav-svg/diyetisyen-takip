import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const KEY="client_health_data_v2";

interface HealthData{
  clientId:string;height:number;weight:number;birthYear:number;gender:"male"|"female"|"other";
  smoking:"none"|"daily"|"weekly"|"quit";smokingCount:number;
  alcohol:"none"|"daily"|"weekly"|"occasional";alcoholGlasses:number;
  allergies:string;medications:string;diseases:string;notes:string;
  updatedAt:string;
}

export default function ClientHealthDataScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [clients,setClients]=useState<ClientRecord[]>([]);
  const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [data,setData]=useState<Partial<HealthData>>({smoking:"none",smokingCount:0,alcohol:"none",alcoholGlasses:0});
  const [editMode,setEditMode]=useState(false);

  useEffect(()=>{load();},[]);
  useEffect(()=>{if(selClient)loadClient(selClient.id);},[selClient]);

  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s)setRole(JSON.parse(s).role??"client");
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
  };
  const loadClient=async(cid:string)=>{
    const d=await AsyncStorage.getItem(`${KEY}_${cid}`);
    if(d)setData(JSON.parse(d));
    else setData({smoking:"none",smokingCount:0,alcohol:"none",alcoholGlasses:0});
  };
  const save=async()=>{
    if(!selClient&&role==="dietitian"){Alert.alert("Hata","Danışan seçin");return;}
    const cid=role==="dietitian"?selClient!.id:"me";
    const updated={...data,clientId:cid,updatedAt:new Date().toISOString()};
    await AsyncStorage.setItem(`${KEY}_${cid}`,JSON.stringify(updated));
    setData(updated);setEditMode(false);
    Alert.alert("✅ Kaydedildi");
  };

  const F=({label,value,onChange,keyboard="default",placeholder=""}:{label:string;value:string;onChange:(v:string)=>void;keyboard?:any;placeholder?:string})=>(
    <View style={{gap:4}}>
      <Text style={{fontSize:13,fontWeight:"600",color:colors.foreground}}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType={keyboard} placeholder={placeholder} placeholderTextColor={colors.muted} editable={editMode||role==="client"}
        style={{borderWidth:1,borderColor:editMode||role==="client"?colors.primary:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:editMode||role==="client"?colors.surface:colors.background,fontSize:14}}/>
    </View>
  );

  const SelBtn=({label,value,options,onChange}:{label:string;value:string;options:{k:string;l:string}[];onChange:(v:string)=>void})=>(
    <View style={{gap:6}}>
      <Text style={{fontSize:13,fontWeight:"600",color:colors.foreground}}>{label}</Text>
      <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>
        {options.map(o=>(<TouchableOpacity key={o.k} onPress={()=>{if(editMode||role==="client")onChange(o.k);}}
          style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:value===o.k?colors.primary:colors.surface,borderWidth:1,borderColor:value===o.k?colors.primary:colors.border}}>
          <Text style={{color:value===o.k?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{o.l}</Text>
        </TouchableOpacity>))}
      </View>
    </View>
  );

  return(<ScreenContainer>
    <BackButton title="🩺 Danışan Sağlık Bilgileri"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:Math.max(insets.bottom+24,32)}}>
      {role==="dietitian"&&<ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
            style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
            <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
          </TouchableOpacity>))}
        </View>
      </ScrollView>}

      {role==="dietitian"&&<View style={{flexDirection:"row",gap:8}}>
        <TouchableOpacity onPress={()=>setEditMode(!editMode)}
          style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:editMode?colors.primary:colors.surface,borderWidth:1,borderColor:editMode?colors.primary:colors.border}}>
          <Text style={{color:editMode?"#fff":colors.foreground,fontWeight:"600"}}>{editMode?"✏️ Düzenleniyor":"✏️ Düzenle"}</Text>
        </TouchableOpacity>
        {editMode&&<TouchableOpacity onPress={save}
          style={{flex:2,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:"#22c55e"}}>
          <Text style={{color:"#fff",fontWeight:"700"}}>💾 Kaydet</Text>
        </TouchableOpacity>}
      </View>}

      {/* Temel Bilgiler */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>📋 Temel Bilgiler</Text>
        <View style={{flexDirection:"row",gap:10}}>
          <View style={{flex:1}}><F label="Boy (cm)" value={String(data.height??"")} onChange={v=>setData(p=>({...p,height:Number(v)}))} keyboard="numeric" placeholder="175"/></View>
          <View style={{flex:1}}><F label="Kilo (kg)" value={String(data.weight??"")} onChange={v=>setData(p=>({...p,weight:Number(v)}))} keyboard="numeric" placeholder="70"/></View>
        </View>
        <View style={{flexDirection:"row",gap:10}}>
          <View style={{flex:1}}><F label="Doğum Yılı" value={String(data.birthYear??"")} onChange={v=>setData(p=>({...p,birthYear:Number(v)}))} keyboard="numeric" placeholder="1990"/></View>
          <View style={{flex:1}}>
            <SelBtn label="Cinsiyet" value={data.gender??"other"} options={[{k:"female",l:"♀️ Kadın"},{k:"male",l:"♂️ Erkek"},{k:"other",l:"Diğer"}]} onChange={v=>setData(p=>({...p,gender:v as any}))}/>
          </View>
        </View>
      </View>

      {/* Sigara */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>🚬 Sigara Kullanımı</Text>
        <SelBtn label="" value={data.smoking??"none"} options={[{k:"none",l:"🚭 Kullanmıyor"},{k:"daily",l:"📅 Günlük"},{k:"weekly",l:"📆 Haftalık"},{k:"quit",l:"✅ Bıraktı"}]} onChange={v=>setData(p=>({...p,smoking:v as any}))}/>
        {(data.smoking==="daily"||data.smoking==="weekly")&&<F label={`Günlük Adet`} value={String(data.smokingCount??"")} onChange={v=>setData(p=>({...p,smokingCount:Number(v)}))} keyboard="numeric" placeholder="10"/>}
      </View>

      {/* Alkol */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>🍷 Alkol Kullanımı</Text>
        <SelBtn label="" value={data.alcohol??"none"} options={[{k:"none",l:"🚫 Kullanmıyor"},{k:"daily",l:"📅 Günlük"},{k:"weekly",l:"📆 Haftalık"},{k:"occasional",l:"🎉 Ara Sıra"}]} onChange={v=>setData(p=>({...p,alcohol:v as any}))}/>
        {data.alcohol!=="none"&&<F label="Ortalama Kadeh (haftalık)" value={String(data.alcoholGlasses??"")} onChange={v=>setData(p=>({...p,alcoholGlasses:Number(v)}))} keyboard="numeric" placeholder="2"/>}
      </View>

      {/* Sağlık */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>🏥 Hastalık ve İlaç</Text>
        <F label="Mevcut Hastalıklar" value={data.diseases??""} onChange={v=>setData(p=>({...p,diseases:v}))} placeholder="Diyabet, hipertansiyon..."/>
        <F label="Kullandığı İlaçlar" value={data.medications??""} onChange={v=>setData(p=>({...p,medications:v}))} placeholder="İlaç adı ve dozu..."/>
        <F label="Alerjiler" value={data.allergies??""} onChange={v=>setData(p=>({...p,allergies:v}))} placeholder="Fıstık, süt, gluten..."/>
      </View>

      {/* Notlar */}
      <View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:8}}>
        <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>📝 Ek Notlar</Text>
        <TextInput value={data.notes??""} onChangeText={v=>setData(p=>({...p,notes:v}))} placeholder="Ek bilgiler..." multiline editable={editMode||role==="client"} placeholderTextColor={colors.muted}
          style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:80,textAlignVertical:"top"}}/>
      </View>

      {data.updatedAt&&<Text style={{color:colors.muted,fontSize:12,textAlign:"center"}}>Son güncelleme: {new Date(data.updatedAt).toLocaleDateString("tr-TR")}</Text>}

      {role==="client"&&<TouchableOpacity onPress={save}
        style={{paddingVertical:16,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
        <Text style={{color:"#fff",fontWeight:"700",fontSize:16}}>💾 Kaydet</Text>
      </TouchableOpacity>}
    </ScrollView>
  </ScreenContainer>);
}
