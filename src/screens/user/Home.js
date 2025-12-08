import React, { useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import ProductCard from "../../components/ProductCard";

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.products);

  // useEffect(() => { dispatch(fetchProducts()); }, []);
useEffect(() => {
- dispatch(fetchProducts());
+ dispatch(fetchProducts(1)); // page 1
}, []);



  if (loading)
    return (
      <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={{flex:1,padding:10}}>
      <Text style={{fontSize:22,fontWeight:"bold",marginBottom:10}}>Products</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({item}) => <ProductCard product={item} />}
      />
    </View>
  );
}
