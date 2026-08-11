import {Text,View,TextInput,FlatList,KeyboardAvoidingView,Platform,TouchableOpacity,ScrollView} from "react-native";
import {ScreenContainer} from "@/components/screen-container";
import {BackButton} from "@/components/back-button";
import {useState,useRef,useEffect} from "react";
import {useColors} from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getMyClients,ClientRecord} from "@/lib/_core/clients-store";
import {useSafeAreaInsets} from "react-native-safe-area-context";
const MSGS_KEY="chat_v3";const SESSION_KEY="session_v3";
const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
interface Msg{id:string;senderId:string;senderName:string;content:string;createdAt:string;status:"sent"|"delivered"|"read";}
function fmtTime(iso:string){const d=new Date(iso);return`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;}
function fmtDate(iso:string){const d=new Date(iso);const t=new Date();const y=new Date(t);y.setDate(t.getDate()-1);if(d.toDateString()===t.toDateString())return"Bugün";if(d.toDateString()===y.toDateString())return"Dün";return`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;}
function showHeader(msgs:Msg[],i:number){if(i===0)return true;return new Date(msgs[i].createdAt).toDateString()!==new Date(msgs[i-1].createdAt).toDateString();}
const INIT:Record<string,Msg[]>={
  "c1":[{id:"1",senderId:"dietitian",senderName:"Diyetisyen",content:"Merhaba Ayşe!",createdAt:new Date(Date.now()-86400000).toISOString(),status:"read"},{id:"2",senderId:"me",senderName:"Ben",content:"Merhaba!",createdAt:new Date(Date.now()-82800000).toISOString(),status:"read"},{id:"3",senderId:"dietitian",senderName:"Diyetisyen",content:"Nasıl gidiyor?",createdAt:new Date(Date.now()-3600000).toISOString(),status:"delivered"}],
  "c2":[{id:"1",senderId:"me",senderName:"Ben",content:"Öğün planı gönderildi.",createdAt:new Date(Date.now()-7200000).toISOString(),status:"read"},{id:"2",senderId:"c2",senderName:"Mehmet",content:"Teşekkürler!",createdAt:new Date(Date.now()-3600000).toISOString(),status:"read"}],
  "c3":[{id:"1",senderId:"c3",senderName:"Fatma",content:"Yarın randevum var mı?",createdAt:new Date(Date.now()-1800000).toISOString(),status:"delivered"}],
  "d1":[{id:"1",senderId:"d1",senderName:"Diyetisyeniniz",content:"Merhaba! Nasıl gidiyor?",createdAt:new Date(Date.now()-7200000).toISOString(),status:"read"},{id:"2",senderId:"me",senderName:"Ben",content:"İyiyim!",createdAt:new Date(Date.now()-3600000).toISOString(),status:"read"}],
};
const DC={id:"d1",name:"Diyetisyeniniz",role:"dietitian"};
export default function MessagingScreen(){
  const colors=useColors();const insets=useSafeAreaInsets();
  const [role,setRole]=useState<"dietitian"|"client">("client");const [uname,setUname]=useState("Ben");
  const [clients,setClients]=useState<ClientRecord[]>([]);const [contact,setContact]=useState<any>(null);
  const [msgs,setMsgs]=useState<Msg[]>([]);const [allMsgs,setAllMsgs]=useState<Record<string,Msg[]>>(INIT);
  const [text,setText]=useState("");const ref=useRef<FlatList>(null);
  useEffect(()=>{loadData();},[]);
  useEffect(()=>{if(contact){const m=[...(allMsgs[contact.id]??[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt));setMsgs(m);setAllMsgs(p=>({...p,[contact.id]:(p[contact.id]??[]).map(m=>m.senderId!=="me"?{...m,status:"read" as const}:m)}));}}, [contact,allMsgs]);
  const loadData=async()=>{
    const s=await AsyncStorage.getItem(SESSION_KEY);if(s){const p=JSON.parse(s);setRole(p.role??"client");setUname(p.name??"Ben");}
    const c=await getMyClients();setClients(c);
    const saved=await AsyncStorage.getItem(MSGS_KEY);if(saved)setAllMsgs(p=>({...INIT,...JSON.parse(saved)}));
  };
  const send=async()=>{
    if(!text.trim()||!contact)return;
    const m:Msg={id:Date.now().toString(),senderId:"me",senderName:uname,content:text.trim(),createdAt:new Date().toISOString(),status:"sent"};
    const up={...allMsgs,[contact.id]:[...(allMsgs[contact.id]??[]),m]};
    setAllMsgs(up);setText("");
    setTimeout(()=>setAllMsgs(p=>({...p,[contact.id]:(p[contact.id]??[]).map(x=>x.id===m.id?{...x,status:"delivered" as const}:x)})),1000);
    await AsyncStorage.setItem(MSGS_KEY,JSON.stringify(up));
    setTimeout(()=>ref.current?.scrollToEnd({animated:true}),100);
  };
  const getTick=(m:Msg)=>{if(m.senderId!=="me")return"";return m.status==="read"?"✓✓":"✓";};
  const getTickColor=(m:Msg)=>m.status==="read"?"#93c5fd":"rgba(255,255,255,0.6)";
  const getLast=(cid:string)=>{const m=allMsgs[cid]??[];return m.length>0?m[m.length-1]:null;};
  const getUnread=(cid:string)=>(allMsgs[cid]??[]).filter(m=>m.senderId!=="me"&&m.status!=="read").length;
  const contacts=role==="dietitian"?clients.map(c=>({id:c.id,name:c.name,role:"client"})):[DC];
  const sorted=[...contacts].sort((a,b)=>(getLast(b.id)?.createdAt??"").localeCompare(getLast(a.id)?.createdAt??""));
  if(!contact)return(
    <ScreenContainer><BackButton title="💬 Mesajlar"/>
      <ScrollView contentContainerStyle={{padding:16,gap:12}}>
        <Text style={{color:colors.muted,fontSize:13}}>{role==="client"?"Diyetisyeninizle mesajlaşın":"Danışanlarınızla mesajlaşın"}</Text>
        {sorted.map(c=>{const last=getLast(c.id);const unread=getUnread(c.id);return(
          <TouchableOpacity key={c.id} onPress={()=>setContact(c)}
            style={{backgroundColor:colors.surface,borderRadius:14,padding:16,borderWidth:1,borderColor:unread>0?colors.primary:colors.border,flexDirection:"row",alignItems:"center",gap:12}}>
            <View style={{width:50,height:50,borderRadius:25,backgroundColor:c.role==="dietitian"?colors.primary:colors.primary+"40",alignItems:"center",justifyContent:"center"}}>
              <Text style={{fontSize:22}}>{c.role==="dietitian"?"👨‍⚕️":"👤"}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:16,fontWeight:"700",color:colors.foreground}}>{c.name}</Text>
              {last&&<View style={{flexDirection:"row",alignItems:"center",gap:4}}>
                {last.senderId==="me"&&<Text style={{fontSize:11,color:last.status==="read"?colors.primary:colors.muted}}>{getTick(last)}</Text>}
                <Text style={{fontSize:13,color:colors.muted}} numberOfLines={1}>{last.content}</Text>
              </View>}
              {last&&<Text style={{fontSize:11,color:colors.muted}}>{fmtTime(last.createdAt)}</Text>}
            </View>
            {unread>0&&<View style={{backgroundColor:colors.primary,borderRadius:10,minWidth:20,height:20,alignItems:"center",justifyContent:"center",paddingHorizontal:4}}>
              <Text style={{color:"#fff",fontSize:11,fontWeight:"700"}}>{unread}</Text>
            </View>}
          </TouchableOpacity>
        );})}
      </ScrollView>
    </ScreenContainer>
  );
  return(<ScreenContainer>
    <BackButton title={contact.name} onBack={()=>setContact(null)}/>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"} keyboardVerticalOffset={Platform.OS==="ios"?90:0}>
      <FlatList ref={ref} data={msgs} keyExtractor={m=>m.id} contentContainerStyle={{padding:16,gap:4,paddingBottom:16}}
        onContentSizeChange={()=>ref.current?.scrollToEnd({animated:false})}
        ListEmptyComponent={<Text style={{color:colors.muted,textAlign:"center",marginTop:40}}>Henüz mesaj yok.</Text>}
        renderItem={({item,index})=>{const isMe=item.senderId==="me";const sh=showHeader(msgs,index);return(<View>
          {sh&&<View style={{alignItems:"center",marginVertical:12}}>
            <View style={{backgroundColor:colors.surface,paddingHorizontal:12,paddingVertical:4,borderRadius:12,borderWidth:1,borderColor:colors.border}}>
              <Text style={{color:colors.muted,fontSize:12,fontWeight:"600"}}>{fmtDate(item.createdAt)}</Text>
            </View>
          </View>}
          <View style={{alignItems:isMe?"flex-end":"flex-start",marginBottom:6}}>
            {!isMe&&<Text style={{fontSize:11,color:colors.muted,marginBottom:2,marginLeft:4}}>{item.senderName}</Text>}
            <View style={{maxWidth:"80%",padding:12,borderRadius:16,backgroundColor:isMe?colors.primary:colors.surface,borderWidth:isMe?0:1,borderColor:colors.border,borderBottomRightRadius:isMe?4:16,borderBottomLeftRadius:isMe?16:4}}>
              <Text style={{color:isMe?"#fff":colors.foreground,fontSize:15,lineHeight:20}}>{item.content}</Text>
              <View style={{flexDirection:"row",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:4}}>
                <Text style={{color:isMe?"rgba(255,255,255,0.7)":colors.muted,fontSize:10}}>{fmtTime(item.createdAt)}</Text>
                {isMe&&<Text style={{fontSize:11,color:getTickColor(item),fontWeight:item.status==="read"?"700":"400"}}>{getTick(item)}</Text>}
              </View>
            </View>
          </View>
        </View>);}}
      />
      <View style={{flexDirection:"row",alignItems:"flex-end",gap:8,paddingHorizontal:12,paddingTop:10,paddingBottom:Math.max(insets.bottom,12)+4,borderTopWidth:1,borderTopColor:colors.border,backgroundColor:colors.background}}>
        <TextInput value={text} onChangeText={setText} placeholder="Mesaj yazın..." placeholderTextColor={colors.muted} multiline maxLength={500}
          style={{flex:1,minHeight:44,maxHeight:120,backgroundColor:colors.surface,borderRadius:22,paddingHorizontal:16,paddingVertical:10,color:colors.foreground,fontSize:15,borderWidth:1,borderColor:colors.border}}/>
        <TouchableOpacity onPress={send} disabled={!text.trim()}
          style={{width:44,height:44,borderRadius:22,backgroundColor:text.trim()?colors.primary:colors.surface,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:text.trim()?colors.primary:colors.border}}>
          <Text style={{fontSize:18,color:text.trim()?"#fff":colors.muted}}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </ScreenContainer>);
}
