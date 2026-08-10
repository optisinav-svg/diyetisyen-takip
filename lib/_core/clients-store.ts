import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY="my_clients";
export interface ClientRecord{id:string;name:string;email:string;addedAt:string;adherenceRate:number;status:"good"|"warning"|"critical";lastSeen:string;}
const DEF:ClientRecord[]=[
  {id:"c1",name:"Ayşe Yılmaz",email:"ayse@email.com",addedAt:new Date().toISOString(),adherenceRate:88,status:"good",lastSeen:"Bugün"},
  {id:"c2",name:"Mehmet Demir",email:"mehmet@email.com",addedAt:new Date().toISOString(),adherenceRate:75,status:"warning",lastSeen:"Dün"},
  {id:"c3",name:"Fatma Kaya",email:"fatma@email.com",addedAt:new Date().toISOString(),adherenceRate:92,status:"good",lastSeen:"Bugün"},
];
export async function getMyClients():Promise<ClientRecord[]>{try{const s=await AsyncStorage.getItem(KEY);if(s){const p=JSON.parse(s);return p.length>0?p:DEF;}return DEF;}catch{return DEF;}}
export async function saveMyClients(clients:ClientRecord[]):Promise<void>{await AsyncStorage.setItem(KEY,JSON.stringify(clients));}
export async function addClient(client:ClientRecord):Promise<void>{const e=await getMyClients();await saveMyClients([...e.filter(c=>c.id!==client.id),client]);}
