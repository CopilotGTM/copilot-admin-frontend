"use client";

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import {
  Flex,
  Box,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  Image,
  InputGroup,
  Icon,
  Link,
} from "@chakra-ui/react";
import { LogIn, User } from "lucide-react";
import PasswordInput from "../password-input";
import { useRouter } from "next/navigation";
import { LoginInput, loginSchema } from "../../app/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { login, AdminUser } from "../../lib/auth";
import useAuthStore from "../../app/stores/use-auth-store";
import { toaster } from "../ui/toaster";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
  getRememberedEmail,
  setRememberedEmail,
  clearRememberedEmail,
} from "../../lib/remember-me";

export default function SigninCard() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const rememberedEmailInitial = typeof window !== "undefined" ? getRememberedEmail() : "";
  const [rememberMe, setRememberMe] = useState(!!rememberedEmailInitial);

  const {
    register: signin,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: rememberedEmailInitial, password: "" },
  });

  useEffect(() => {
    if (rememberedEmailInitial) {
      setValue("email", rememberedEmailInitial);
    }
  }, [rememberedEmailInitial, setValue]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.data.state === "ACTIVE" && data.data.tokens) {
        setAuth(
          data.data.tokens.access_token,
          data.data.tokens.refresh_token,
          {
            email: data.data.email!,
            first_name: data.data.first_name!,
            last_name: data.data.last_name!,
            role: data.data.role!,
            state: data.data.state,
            created_at: data.data.created_at!,
            email_verified: data.data.email_verified!,
            last_login_at: data.data.last_login_at!,
          } as AdminUser,
          rememberMe
        );

        // Handle remembered email securely (no password stored)
        if (rememberMe) {
          setRememberedEmail(data.data.email);
        } else {
          clearRememberedEmail();
        }

        toaster.create({
          title: "Login successful",
          duration: 2000,
        });
        router.push("/");
      } else if (data.data.state === "PASSWORD_CHANGE_REQUIRED" && data.data.password_reset_link) {
        toaster.create({
          title: "Password change required",
          description: "Please set your password to continue",
          duration: 3000,
        });
        router.push(`${data.data.password_reset_link}&force_change=true`);
      }
    },
    onError: () => {
      toaster.create({
        title: "Login failed",
        description: "Something went wrong",
        type: "error",
        duration: 2000,
      });
    },
  });

  const handleRememberMeChange = () => {
    const newRememberMe = !rememberMe;
    setRememberMe(newRememberMe);
    if (!newRememberMe) {
      clearRememberedEmail();
    }
  };

  const onSubmit = async (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Box
          w={"md"}
          rounded={"xl"}
          bg={"white"}
          boxShadow={"md"}
          blur={"md"}
          p={8}
        >
          <Stack align={"center"}>
            <Image src="./logo.svg" alt="Copilot-GTM logo" />
            <Heading fontSize={"2xl"} fontWeight={"semibold"} color={"gray.800"}>
              Welcome back
            </Heading>
            <Text fontSize={"sm"} fontWeight={"medium"} color={"gray.500"}>
              Log in to your CopilotGTM Admin Panel
            </Text>
          </Stack>
          
          <Stack gap={5} mt={12}>
            <FormControl display="flex" flexDirection="column" gap={4}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                Username
              </FormLabel>
              <InputGroup
                startElement={
                  <Button disabled variant={"ghost"} w={"48px"} h={"48px"}>
                    <Icon as={User} color="gray.400" size={"md"} />
                  </Button>
                }
              >
                <Input
                  size={"lg"}
                  variant={"outline"}
                  type="email"
                  borderRadius={6}
                  height={"48px"}
                  pr={"16px"}
                  placeholder="Enter your username"
                  _placeholder={{
                    fontSize: "md",
                    fontWeight: "normal",
                    color: "gray.400",
                  }}
                  {...signin("email")}
                />
              </InputGroup>
              {errors.email && (
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              )}
              {rememberedEmailInitial && (
                <Text fontSize="xs" color="green.500" mt={1}>
                  ✓ Email remembered from previous login
                </Text>
              )}
            </FormControl>

            <PasswordInput
              error={errors.password?.message || ""}
              {...signin("password")}
            />

            <Stack gap={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                <Checkbox.Root
                  checked={rememberMe}
                  onCheckedChange={handleRememberMeChange}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    css={{
                      "[data-state=checked] &": {
                        backgroundColor: "purple.600",
                        borderColor: "purple.600",
                      },
                    }}
                  />
                  <Checkbox.Label
                    fontSize="sm"
                    fontWeight="normal"
                    color="gray.600"
                  >
                    Remember me
                  </Checkbox.Label>
                </Checkbox.Root>

                <Link
                  fontSize={"sm"}
                  fontWeight={"semibold"}
                  color={"purple.600"}
                  href="/forgot-password"
                  _hover={{
                    opacity: 0.8,
                    textDecoration: "none",
                  }}
                  _focus={{
                    outline: "none",
                  }}
                  _active={{
                    outline: "none",
                  }}
                >
                  Forgot password?
                </Link>
              </Stack>
              
              <Button
                bg={"purple.600"}
                height={"48px"}
                borderRadius={"6px"}
                fontSize={"lg"}
                fontWeight={"semibold"}
                color={"white"}
                _hover={{ bg: "purple.500" }}
                onClick={handleSubmit(onSubmit)}
                loading={isSubmitting || loginMutation.isPending}
                disabled={!isValid || isSubmitting || loginMutation.isPending}
                loadingText="Signing in"
                spinnerPlacement="end"
              >
                {!loginMutation.isPending && (
                  <>
                    Sign in
                    <Icon as={LogIn} boxSize={4} strokeWidth={2.5} ml={2} />
                  </>
                )}
              </Button>
            </Stack>
            
            {loginMutation.isError && (
              <Text textAlign={"center"} fontSize={"sm"} color={"red.500"}>
                An error occurred during login
              </Text>
            )}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
