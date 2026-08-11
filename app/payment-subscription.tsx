import {BackButton} from "@/components/back-button";
import {ScrollView,Text,View,TouchableOpacity,Alert,TextInput} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import {getUserRegistration} from "@/lib/_core/user-registration";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
interface Plan{id:string;name:string;price:number;period:string;features:string[];active:boolean;}
interface Payment{id:string;clientId:string;clientName:string;planName:string;amount:number;date:string;status:"completed"|"pending"|"failed";}
interface Invoice{id:string;clientId:string;clientName:string;planName:string;amount:number;date:string;paid:boolean;paidAt?:string;}
const DEF_PLANS:Plan[]=[
  {id:"free",name:"Ücretsiz",price:0,period:"Aylık",features:["Temel profil","5 öğün/gün"],active:true},
  {id:"basic",name:"Başlangıç",price:149,period:"Aylık",features:["Sınırsız öğün","Mesajlaşma","Haftalık rapor"],active:true},
  {id:"pro",name:"Profesyonel",price:299,period:"Aylık",features:["Tüm özellikler","Video danışma","Öncelikli destek"],active:true},
];
const DEF_PAYMENTS:Payment[]=[
  {id:"p1",clientId:"c1",clientName:"Ayşe Yılmaz",planName:"Başlangıç",amount:149,date:"2026-06-01",status:"completed"},
  {id:"p2",clientId:"c2",clientName:"Mehmet Demir",planName:"Profesyonel",amount:299,date:"2026-05-28",status:"completed"},
  {id:"p3",clientId:"c3",clientName:"Fatma Kaya",planName:"Başlangıç",amount:149,date:"2026-05-15",status:"pending"},
  {id:"p4",clientId:"c1",clientName:"Ayşe Yılmaz",planName:"Başlangıç",amount:149,date:"2026-05-01",status:"completed"},
];
const DEF_INVOICES:Invoice[]=[
  {id:"i1",clientId:"c1",clientName:"Ayşe Yılmaz",planName:"Başlangıç",amount:149,date:"2026-06-01",paid:true,paidAt:"2026-06-01"},
  {id:"i2",clientId:"c2",clientName:"Mehmet Demir",planName:"Profesyonel",amount:299,date:"2026-06-01",paid:false},
];
export default function PaymentSubscriptionScreen(){
  const colors=useColors();
  const [role,setRole]=useState<"dietitian"|"client">("client");
  const [clients,setClients]=useState<ClientRecord[]>([]);const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [tab,setTab]=useState<"plans"|"history"|"invoices">("plans");
  const [plans,setPlans]=useState<Plan[]>(DEF_PLANS);const [invoices,setInvoices]=useState<Invoice[]>(DEF_INVOICES);
  const [showNew,setShowNew]=useState(false);const [pName,setPName]=useState("");const [pPrice,setPPrice]=useState("");const [pPeriod,setPPeriod]=useState("Aylık");const [pFeatures,setPFeatures]=useState("");
  const [sortBy,setSortBy]=useState<"date"|"client">("date");
  useEffect(()=>{load();},[]);
  const load=async()=>{const u=await getUserRegistration();setRole(u?.role??"client");const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);};
  const addPlan=()=>{if(!pName||!pPrice){Alert.alert("Hata","Ad ve ücret girin");return;}setPlans(p=>[...p,{id:Date.now().toString(),name:pName,price:Number(pPrice),period:pPeriod,features:pFeatures.split("\n").filter(f=>f.trim()),active:true}]);setShowNew(false);setPName("");setPPrice("");Alert.alert("✅ Paket oluşturuldu");};
  const markPaid=(id:string)=>{setInvoices(p=>p.map(i=>i.id===id?{...i,paid:true,paidAt:new Date().toISOString().split("T")[0]}:i));Alert.alert("✅ Ödendi");};
  const fp=selClient?DEF_PAYMENTS.filter(p=>p.clientId===selClient.id).sort((a,b)=>sortBy==="date"?b.date.localeCompare(a.date):a.clientName.localeCompare(b.clientName)):[];
  const total=DEF_PAYMENTS.filter(p=>p.status==="completed").reduce((s,p)=>s+p.amount,0);
  const sc=(s:string)=>s==="completed"?"#22c55e":s==="pending"?"#f97316":"#ef4444";
  const sl=(s:string)=>s==="completed"?"✅ Tamamlandı":s==="pending"?"⏳ Bekliyor":"❌ Başarısız";
  return(<ScreenContainer>
    <BackButton title="💳 Ödeme & Abonelik"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:32}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"plans",l:"📦 Paketler"},{k:"history",l:"💰 Ödeme Geçmişi"},{k:"invoices",l:"🧾 Fatura"}].map(t=>(
            <TouchableOpacity key={t.k} onPress={()=>setTab(t.k as any)}
              style={{paddingHorizontal:16,paddingVertical:10,borderRadius:20,backgroundColor:tab===t.k?colors.primary:colors.surface,borderWidth:1,borderColor:tab===t.k?colors.primary:colors.border}}>
              <Text style={{color:tab===t.k?"#fff":colors.foreground,fontWeight:"600"}}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {tab==="plans"&&(<>
        {role==="dietitian"&&<>
          <View style={{backgroundColor:"#22c55e20",borderRadius:12,padding:14,borderWidth:1,borderColor:"#22c55e",flexDirection:"row",justifyContent:"space-between"}}>
            <Text style={{color:"#22c55e",fontWeight:"700"}}>💰 Toplam Gelir</Text>
            <Text style={{color:"#22c55e",fontWeight:"700",fontSize:18}}>{total} ₺</Text>
          </View>
          <TouchableOpacity onPress={()=>setShowNew(!showNew)} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
            <Text style={{color:"#fff",fontWeight:"700"}}>+ Yeni Paket Oluştur</Text>
          </TouchableOpacity>
          {showNew&&<View style={{backgroundColor:colors.surface,borderRadius:12,padding:16,gap:12,borderWidth:1,borderColor:colors.border}}>
            <TextInput value={pName} onChangeText={setPName} placeholder="Paket adı" placeholderTextColor={colors.muted} style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background}}/>
            <TextInput value={pPrice} onChangeText={setPPrice} placeholder="Ücret (₺)" keyboardType="numeric" placeholderTextColor={colors.muted} style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background}}/>
            <View style={{flexDirection:"row",gap:8}}>
              {["Aylık","Yıllık","Tek Seferlik"].map(p=>(<TouchableOpacity key={p} onPress={()=>setPPeriod(p)}
                style={{flex:1,paddingVertical:8,borderRadius:8,alignItems:"center",backgroundColor:pPeriod===p?colors.primary:colors.surface,borderWidth:1,borderColor:pPeriod===p?colors.primary:colors.border}}>
                <Text style={{color:pPeriod===p?"#fff":colors.foreground,fontSize:12,fontWeight:"600"}}>{p}</Text>
              </TouchableOpacity>))}
            </View>
            <TextInput value={pFeatures} onChangeText={setPFeatures} placeholder="İçerikler (her satıra bir özellik)" multiline placeholderTextColor={colors.muted} style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background,minHeight:60}}/>
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity onPress={()=>setShowNew(false)} style={{flex:1,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}><Text style={{color:colors.foreground}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity onPress={addPlan} style={{flex:2,paddingVertical:12,borderRadius:10,alignItems:"center",backgroundColor:colors.primary}}><Text style={{color:"#fff",fontWeight:"700"}}>✅ Oluştur</Text></TouchableOpacity>
            </View>
          </View>}
        </>}
        {plans.map(p=>(<View key={p.id} style={{backgroundColor:colors.surface,borderRadius:14,padding:16,gap:8,borderWidth:2,borderColor:p.id==="pro"?colors.primary:colors.border}}>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>{p.name}</Text>
          <Text style={{fontSize:22,fontWeight:"bold",color:colors.primary}}>{p.price===0?"Ücretsiz":`${p.price} ₺/${p.period}`}</Text>
          {p.features.map((f,i)=><Text key={i} style={{color:colors.foreground,fontSize:13}}>✓ {f}</Text>)}
        </View>))}
      </>)}
      {tab==="history"&&role==="dietitian"&&(<>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
              style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
              <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>👤 {c.name}</Text>
            </TouchableOpacity>))}
          </View>
        </ScrollView>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"date",l:"📅 Tarihe Göre"},{k:"client",l:"👤 Danışana Göre"}].map(s=>(<TouchableOpacity key={s.k} onPress={()=>setSortBy(s.k as any)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:sortBy===s.k?colors.primary:colors.surface,borderWidth:1,borderColor:sortBy===s.k?colors.primary:colors.border}}>
            <Text style={{color:sortBy===s.k?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{s.l}</Text>
          </TouchableOpacity>))}
        </View>
        {fp.length===0?<Text style={{color:colors.muted,textAlign:"center"}}>Bu danışana ait ödeme yok.</Text>
          :fp.map(p=>(<View key={p.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,gap:6,borderWidth:1,borderColor:colors.border}}>
            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
              <Text style={{fontWeight:"700",color:colors.foreground}}>📦 {p.planName}</Text>
              <Text style={{fontWeight:"700",color:colors.primary}}>{p.amount} ₺</Text>
            </View>
            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
              <Text style={{color:colors.muted,fontSize:12}}>📅 {p.date}</Text>
              <Text style={{color:sc(p.status),fontSize:12,fontWeight:"600"}}>{sl(p.status)}</Text>
            </View>
          </View>))}
      </>)}
      {tab==="invoices"&&(<>
        {role==="dietitian"?(<>
          {invoices.map(inv=>(<View key={inv.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,gap:8,borderWidth:1,borderColor:inv.paid?"#22c55e":"#f97316"}}>
            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
              <View><Text style={{fontWeight:"700",color:colors.foreground}}>👤 {inv.clientName}</Text><Text style={{color:colors.muted,fontSize:12}}>📦 {inv.planName} · {inv.amount} ₺</Text></View>
              <Text style={{color:inv.paid?"#22c55e":"#f97316",fontWeight:"700"}}>{inv.paid?"✅ Ödendi":"⏳ Bekliyor"}</Text>
            </View>
            {!inv.paid&&<TouchableOpacity onPress={()=>markPaid(inv.id)} style={{paddingVertical:10,borderRadius:10,alignItems:"center",backgroundColor:"#22c55e20",borderWidth:1,borderColor:"#22c55e"}}>
              <Text style={{color:"#22c55e",fontWeight:"700"}}>✅ Ödendi Olarak İşaretle</Text>
            </TouchableOpacity>}
          </View>))}
        </>):(
          <View style={{backgroundColor:"#22c55e20",borderRadius:12,padding:16,borderWidth:2,borderColor:"#22c55e",gap:8}}>
            <Text style={{fontWeight:"700",color:"#22c55e",fontSize:16}}>✅ Aktif Paket: Başlangıç</Text>
            <Text style={{color:colors.foreground}}>💰 149 ₺/Aylık · Yenileme: 1 Temmuz 2026</Text>
          </View>
        )}
      </>)}
    </ScrollView>
  </ScreenContainer>);
}
