import {ScrollView,Text,View,TouchableOpacity,TextInput,Alert,Modal,Switch} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useColors} from "@/hooks/use-colors";
import {useState,useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
const APPTS_KEY="appointments_v2";const REM_KEY="appt_reminder";
const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DAYS=["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];
const HOURS=Array.from({length:13},(_,i)=>`${(i+8).toString().padStart(2,"0")}:00`);
interface Appt{id:string;clientId:string;clientName:string;date:string;startTime:string;endTime:string;notes:string;createdAt:string;}
interface Rem{clientActive:boolean;clientTime:string;dietitianActive:boolean;dietitianTime:string;}
function fd(d:Date){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function dd(s:string){const d=new Date(s+"T00:00:00");return`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;}
function daysInMonth(y:number,m:number){return new Date(y,m+1,0).getDate();}
function firstDay(y:number,m:number){const d=new Date(y,m,1).getDay();return d===0?6:d-1;}
function isWeekend(s:string){const d=new Date(s+"T00:00:00").getDay();return d===0||d===6;}
function getWeekDays(date:Date){const dow=date.getDay()===0?6:date.getDay()-1;const start=new Date(date);start.setDate(date.getDate()-dow);return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});}
export default function CalendarAppointments(){
  const colors=useColors();
  const [role,setRole]=useState<"dietitian"|"client">("dietitian");const [uname,setUname]=useState("Diyetisyen");
  const [appts,setAppts]=useState<Appt[]>([]);const [clients,setClients]=useState<ClientRecord[]>([]);
  const [rem,setRem]=useState<Rem>({clientActive:true,clientTime:"10:00",dietitianActive:true,dietitianTime:"20:00"});
  const [view,setView]=useState<"monthly"|"weekly"|"reminder">("monthly");
  const [year,setYear]=useState(new Date().getFullYear());const [month,setMonth]=useState(new Date().getMonth());
  const [selDate,setSelDate]=useState<string|null>(null);const [weekDate,setWeekDate]=useState(new Date());
  const [showModal,setShowModal]=useState(false);const [selClient,setSelClient]=useState<ClientRecord|null>(null);
  const [startTime,setStartTime]=useState("09:00");const [endTime,setEndTime]=useState("10:00");const [notes,setNotes]=useState("");
  useEffect(()=>{load();},[]);
  const load=async()=>{
    const s=await AsyncStorage.getItem("session_v3");if(s){const p=JSON.parse(s);setRole(p.role??"dietitian");setUname(p.name??"Diyetisyen");}
    const saved=await AsyncStorage.getItem(APPTS_KEY);if(saved)setAppts(JSON.parse(saved));
    const rs=await AsyncStorage.getItem(REM_KEY);if(rs)setRem(JSON.parse(rs));
    const c=await getMyClients();setClients(c);if(c.length>0)setSelClient(c[0]);
  };
  const save=async(list:Appt[])=>{setAppts(list);await AsyncStorage.setItem(APPTS_KEY,JSON.stringify(list));};
  const saveRem=async(r:Rem)=>{setRem(r);await AsyncStorage.setItem(REM_KEY,JSON.stringify(r));};
  const create=async()=>{
    if(!selDate||!selClient){Alert.alert("Hata","Tarih ve danışan seçin");return;}
    const a:Appt={id:Date.now().toString(),clientId:selClient.id,clientName:selClient.name,date:selDate,startTime,endTime,notes,createdAt:new Date().toISOString()};
    await save([...appts,a]);setShowModal(false);setNotes("");
    Alert.alert("✅ Randevu Oluşturuldu",`${selClient.name}'a mesaj gönderildi:\n\n"${dd(selDate)} tarihinde, ${startTime}-${endTime} saat aralığında, ${uname} ile randevunuz oluşturulmuştur."`);
  };
  const today=fd(new Date());const apptDates=new Set(appts.map(a=>a.date));const selAppts=appts.filter(a=>a.date===selDate);
  const busy=new Set(selDate?appts.filter(a=>a.date===selDate).map(a=>a.startTime):[]);
  const wdays=getWeekDays(weekDate);const wappts=appts.filter(a=>wdays.some(d=>fd(d)===a.date));
  const dim=daysInMonth(year,month);const fd1=firstDay(year,month);
  return(<ScreenContainer>
    <BackButton title="📅 Randevu Sistemi"/>
    <ScrollView contentContainerStyle={{padding:16,gap:14,paddingBottom:32}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:"row",gap:8}}>
          {[{k:"monthly",l:"📅 Aylık"},{k:"weekly",l:"📆 Haftalık"},{k:"reminder",l:"🔔 Hatırlatma"}].map(v=>(
            <TouchableOpacity key={v.k} onPress={()=>setView(v.k as any)}
              style={{paddingHorizontal:16,paddingVertical:10,borderRadius:20,backgroundColor:view===v.k?colors.primary:colors.surface,borderWidth:1,borderColor:view===v.k?colors.primary:colors.border}}>
              <Text style={{color:view===v.k?"#fff":colors.foreground,fontWeight:"600"}}>{v.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {view==="monthly"&&<View style={{gap:14}}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:colors.surface,borderRadius:12,padding:12,borderWidth:1,borderColor:colors.border}}>
          <TouchableOpacity onPress={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} style={{padding:8}}><Text style={{color:colors.primary,fontSize:20,fontWeight:"700"}}>←</Text></TouchableOpacity>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} style={{padding:8}}><Text style={{color:colors.primary,fontSize:20,fontWeight:"700"}}>→</Text></TouchableOpacity>
        </View>
        <View style={{backgroundColor:colors.surface,borderRadius:12,padding:12,borderWidth:1,borderColor:colors.border}}>
          <View style={{flexDirection:"row",marginBottom:8}}>
            {DAYS.map((d,i)=><Text key={d} style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:12,color:i>=5?"#ef4444":colors.muted}}>{d}</Text>)}
          </View>
          <View style={{flexDirection:"row",flexWrap:"wrap"}}>
            {Array.from({length:fd1}).map((_,i)=><View key={`e${i}`} style={{width:"14.28%",height:44}}/>)}
            {Array.from({length:dim},(_,i)=>i+1).map(day=>{
              const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const hasA=apptDates.has(ds);const isT=ds===today;const isSel=ds===selDate;const wknd=isWeekend(ds);
              return(<TouchableOpacity key={day} onPress={()=>setSelDate(isSel?null:ds)} style={{width:"14.28%",height:44,alignItems:"center",justifyContent:"center"}}>
                <View style={{width:34,height:34,borderRadius:17,alignItems:"center",justifyContent:"center",backgroundColor:isSel?colors.primary:isT?colors.primary+"30":"transparent"}}>
                  <Text style={{color:isSel?"#fff":isT?colors.primary:wknd?"#ef4444":colors.foreground,fontWeight:isT||isSel?"700":"400",fontSize:14}}>{day}</Text>
                </View>
                {hasA&&<View style={{width:5,height:5,borderRadius:3,backgroundColor:colors.primary,marginTop:1}}/>}
              </TouchableOpacity>);
            })}
          </View>
        </View>
        {selDate&&<View style={{gap:10}}>
          <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>📅 {dd(selDate)}</Text>
          {selAppts.length===0?<Text style={{color:colors.muted}}>Bu günde randevu yok.</Text>
            :selAppts.map(a=><View key={a.id} style={{backgroundColor:colors.surface,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.primary,gap:6}}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                <Text style={{fontWeight:"700",color:colors.foreground}}>🕐 {a.startTime} - {a.endTime}</Text>
                {role==="dietitian"&&<TouchableOpacity onPress={()=>Alert.alert("İptal","",[{text:"Hayır",style:"cancel"},{text:"İptal Et",style:"destructive",onPress:()=>save(appts.filter(x=>x.id!==a.id))}])}><Text style={{color:"#ef4444"}}>İptal</Text></TouchableOpacity>}
              </View>
              <Text style={{color:colors.foreground}}>👤 {a.clientName}</Text>
              {a.notes?<Text style={{color:colors.muted,fontSize:13}}>{a.notes}</Text>:null}
            </View>)}
          {role==="dietitian"&&<>
            <Text style={{fontWeight:"600",color:colors.foreground}}>Başlangıç Saati:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{flexDirection:"row",gap:8}}>
                {HOURS.map(h=>{const b=busy.has(h);const c=startTime===h;return(
                  <TouchableOpacity key={h} onPress={()=>{if(!b){setStartTime(h);setEndTime(`${String(parseInt(h)+1).padStart(2,"0")}:00`);}}} disabled={b}
                    style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:b?"#ef444430":c?colors.primary:colors.surface,borderWidth:1,borderColor:b?"#ef4444":c?colors.primary:colors.border}}>
                    <Text style={{color:b?"#ef4444":c?"#fff":colors.foreground,fontWeight:"600",fontSize:13}}>{b?`${h} ✗`:h}</Text>
                  </TouchableOpacity>);})}
              </View>
            </ScrollView>
            <TouchableOpacity onPress={()=>setShowModal(true)} style={{paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700",fontSize:15}}>+ {dd(selDate)} {startTime} Randevu Oluştur</Text>
            </TouchableOpacity>
          </>}
        </View>}
      </View>}
      {view==="weekly"&&<View style={{gap:14}}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:colors.surface,borderRadius:12,padding:12,borderWidth:1,borderColor:colors.border}}>
          <TouchableOpacity onPress={()=>{const d=new Date(weekDate);d.setDate(d.getDate()-7);setWeekDate(d);}} style={{padding:8}}><Text style={{color:colors.primary,fontSize:20,fontWeight:"700"}}>←</Text></TouchableOpacity>
          <Text style={{fontSize:13,fontWeight:"700",color:colors.foreground}}>{dd(fd(wdays[0]))} — {dd(fd(wdays[6]))}</Text>
          <TouchableOpacity onPress={()=>{const d=new Date(weekDate);d.setDate(d.getDate()+7);setWeekDate(d);}} style={{padding:8}}><Text style={{color:colors.primary,fontSize:20,fontWeight:"700"}}>→</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection:"row",gap:8}}>
            {wdays.map((day,i)=>{const ds=fd(day);const da=appts.filter(a=>a.date===ds);const isT=ds===today;const wknd=i>=5;return(
              <TouchableOpacity key={ds} onPress={()=>{setSelDate(ds);setView("monthly");setMonth(day.getMonth());setYear(day.getFullYear());}}
                style={{width:100,backgroundColor:isT?colors.primary+"20":colors.surface,borderRadius:12,padding:10,borderWidth:isT?2:1,borderColor:isT?colors.primary:wknd?"#ef444440":colors.border,gap:6,minHeight:120}}>
                <Text style={{fontWeight:"700",color:wknd?"#ef4444":isT?colors.primary:colors.foreground,fontSize:12}}>{DAYS[i]}</Text>
                <Text style={{fontWeight:"700",color:wknd?"#ef4444":isT?colors.primary:colors.foreground,fontSize:18}}>{day.getDate()}</Text>
                {da.map(a=><View key={a.id} style={{backgroundColor:colors.primary,borderRadius:6,padding:4}}>
                  <Text style={{color:"#fff",fontSize:10,fontWeight:"600"}} numberOfLines={1}>{a.startTime} {a.clientName.split(" ")[0]}</Text>
                </View>)}
              </TouchableOpacity>);})}
          </View>
        </ScrollView>
      </View>}
      {view==="reminder"&&<View style={{gap:14}}>
        {[{key:"client",title:"👤 Danışan Hatırlatması",desc:"Randevudan bir gün önce danışana bildirim gider.",aKey:"clientActive" as keyof Rem,tKey:"clientTime" as keyof Rem},
          {key:"dietitian",title:"👨‍⚕️ Diyetisyen Hatırlatması",desc:"Her gün belirtilen saatte ertesi güne ait randevular bildirim olarak gider.",aKey:"dietitianActive" as keyof Rem,tKey:"dietitianTime" as keyof Rem}].map(r=>(
          <View key={r.key} style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.border,gap:12}}>
            <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{r.title}</Text>
            <Text style={{color:colors.muted,fontSize:13}}>{r.desc}</Text>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{color:colors.foreground}}>🔔 Hatırlatma</Text>
              <Switch value={rem[r.aKey] as boolean} onValueChange={v=>saveRem({...rem,[r.aKey]:v})} trackColor={{false:colors.border,true:colors.primary}}/>
            </View>
            {rem[r.aKey]&&<TextInput value={rem[r.tKey] as string} onChangeText={v=>saveRem({...rem,[r.tKey]:v})} placeholder="10:00" placeholderTextColor={colors.muted}
              style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.background,width:100}}/>}
          </View>
        ))}
      </View>}
    </ScrollView>
    <Modal visible={showModal} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:"#00000080",justifyContent:"flex-end"}}>
        <View style={{backgroundColor:colors.background,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14}}>
          <Text style={{fontSize:18,fontWeight:"700",color:colors.foreground}}>📅 Randevu Oluştur</Text>
          <Text style={{color:colors.muted}}>📅 {selDate?dd(selDate):""} 🕐 {startTime} - {endTime}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:"row",gap:8}}>
              {clients.map(c=>(<TouchableOpacity key={c.id} onPress={()=>setSelClient(c)}
                style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:selClient?.id===c.id?colors.primary:colors.surface,borderWidth:1,borderColor:selClient?.id===c.id?colors.primary:colors.border}}>
                <Text style={{color:selClient?.id===c.id?"#fff":colors.foreground,fontWeight:"600"}}>{c.name}</Text>
              </TouchableOpacity>))}
            </View>
          </ScrollView>
          <View style={{flexDirection:"row",gap:10}}>
            <View style={{flex:1,gap:4}}><Text style={{fontWeight:"600",color:colors.foreground}}>Başlangıç</Text>
              <TextInput value={startTime} onChangeText={setStartTime} placeholder="09:00" placeholderTextColor={colors.muted}
                style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
            </View>
            <View style={{flex:1,gap:4}}><Text style={{fontWeight:"600",color:colors.foreground}}>Bitiş</Text>
              <TextInput value={endTime} onChangeText={setEndTime} placeholder="10:00" placeholderTextColor={colors.muted}
                style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface}}/>
            </View>
          </View>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Not ekleyin..." multiline placeholderTextColor={colors.muted}
            style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,color:colors.foreground,backgroundColor:colors.surface,minHeight:60}}/>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity onPress={()=>setShowModal(false)} style={{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.foreground}}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={create} style={{flex:2,paddingVertical:14,borderRadius:12,alignItems:"center",backgroundColor:colors.primary}}>
              <Text style={{color:"#fff",fontWeight:"700"}}>✅ Randevu Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </ScreenContainer>);
}
