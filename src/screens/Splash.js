import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setWishlist } from "../redux/slices/wishlistSlice";
import { fetchWishlistProducts } from "../api/wishlistApi";
import { setCart } from "../redux/slices/cartSlice";
import { fetchCartFromServer } from "../api/cartApi";

export default function Splash({ navigation }){

  const dispatch = useDispatch();

  useEffect(()=>{ init(); },[]);

  const init = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const savedUser = await AsyncStorage.getItem("userData");

    setTimeout(async()=>{
      if(token && savedUser){
        //🔥 Load real wishlist product objects from backend
        try{
  const wishlist = await fetchWishlistProducts();  // backend already returns products
dispatch(setWishlist(wishlist));
              // UI now receives real products
               const cart = await fetchCartFromServer();
               dispatch(setCart(cart));


        }catch(err){
          console.log("wishlist fetch fail",err);
        }

        const user = JSON.parse(savedUser);
        if(user.role === "admin") navigation.replace("AdminTabs");
        else navigation.replace("UserTabs");
      }
      else navigation.replace("Login");
    },1000);
  };

  return(
    <View style={styles.container}>
      <Text style={styles.logo}>🛍️ E-Shop</Text>
      <ActivityIndicator size="large" color="#007bff" style={{marginTop:10}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#fff"},
  logo:{fontSize:32,fontWeight:"900"}
});
