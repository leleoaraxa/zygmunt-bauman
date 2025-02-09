import { useCallback, useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  Flex,
  HStack,
  Text,
  View,
  useToast,
} from "native-base";

import { AppError } from "@utils/AppError";
import { ProductDTO } from "@dtos/ProductDTO";
import { api } from "@services/api";

import { HeaderRoutes } from "@components/HeaderRoutes";
import { Loading } from "@components/Loading";
import { FormatCurrency } from "@utils/FormatCurrency";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@components/Button";
import { WhatsappLogo } from "phosphor-react-native";
import { ProductContent } from "@components/ProductContent";
import { Linking } from "react-native";

type RouteParamsProps = {
  productId: number;
};

export function ProductDetails() {
  const { bottom } = useSafeAreaInsets();
  const toast = useToast();

  const [product, setProduct] = useState<ProductDTO>({} as ProductDTO);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const route = useRoute();
  const { productId } = route.params as RouteParamsProps;

  async function fetchProductDetails() {
    try {
      setIsLoadingProduct(true);
      const response = await api.get(`products/${productId}`);

      setProduct(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os detalhes do produto";

      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoadingProduct(false);
    }
  }

  const handleGoToWhatsapp = useCallback(async () => {
    const url = `https://wa.me/${product.user.tel}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      toast.show({
        title: "Ops, não foi possível te encaminhar para o whatsapp.",
        placement: "top",
        bgColor: "red.500",
      });
    }
  }, [product]);

  useEffect(() => {
    fetchProductDetails();
  }, []);

  return (
    <View flex={1} bg="gray.200">
      <Flex px={6}>
        <HeaderRoutes goBackButton />
      </Flex>

      {isLoadingProduct ? <Loading /> : <ProductContent product={product} />}
      <HStack
        pb={bottom / 4 + 20}
        bg="gray.100"
        p={6}
        space={14}
        alignItems="center"
        justifyContent="space-between"
      >
        <Text
          fontSize="xl"
          fontFamily={!product?.is_active ? "body" : "heading"}
          color="blue.700"
        >
          <Text fontSize="sm">R$</Text> {FormatCurrency(product.price)}
        </Text>
        <Button
          flex={1}
          title="Entrar em contato"
          leftIcon={<WhatsappLogo color="white" weight="fill" size={18} />}
          onPress={handleGoToWhatsapp}
        />
      </HStack>
    </View>
  );
}
