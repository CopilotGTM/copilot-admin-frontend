"use client";

import { Flex } from "@chakra-ui/react";
import { redirect } from "next/navigation";
// cleaned unused imports

const Home: React.FC = () => {
  redirect("/organizations");
  return <Flex />;
};

export default Home;
