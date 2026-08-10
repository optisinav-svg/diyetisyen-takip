import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY="user_registration";
export interface UserRegistration{name:string;username:string;email:string;password:string;role:"dietitian"|"client";registeredAt:string;biometricEnabled:boolean;emailVerified:boolean;}
export async function saveUserRegistration(u:Omit<UserRegistration,"registeredAt">):Promise<void>{const e=await getUserRegistration();await AsyncStorage.setItem(KEY,JSON.stringify({...u,registeredAt:e?.registeredAt??new Date().toISOString()}));}
export async function getUserRegistration():Promise<UserRegistration|null>{try{const d=await AsyncStorage.getItem(KEY);return d?JSON.parse(d):null;}catch{return null;}}
export async function clearUserRegistration():Promise<void>{await AsyncStorage.removeItem(KEY);}
export async function isUserRegistered():Promise<boolean>{return(await getUserRegistration())!==null;}
