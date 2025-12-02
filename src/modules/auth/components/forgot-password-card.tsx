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
  Stack,
  Button,
  Heading,
  Text,
  Image,
  InputGroup,
  Icon,
  Link,
  Center,
  Alert,
} from "@chakra-ui/react";
import { Mail, MoveLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/modules/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword as sendResetPasswordLink } from "@/modules/auth/api";
import { useState } from "react";

export function ForgotPasswordCard() {
  const [alertState, setAlertState] = useState<
    | { status: "success" | "error"; title: string; description?: string }
    | null
  >(null);

  // Initialize React Hook Form with Zod schema
  const {
    register: forgetPassword,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange", // Validate on blur and submit
    defaultValues: {
      email: "",
    },
  });

  const forgetPasswordMutation = useMutation({
    mutationFn: sendResetPasswordLink,
    onSuccess: (data) => {
      console.log("@@@@@@data", data);
      setAlertState({
        status: "success",
        title: "Reset link sent successfully!",
        description:
          "Please check your email inbox. If you don't see it, check your spam/junk folder.",
      });
      reset({ email: "" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Reset password error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Something went wrong";
      setAlertState({
        status: "error",
        title: "Failed to send reset link",
        description: message,
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordInput) => {
    setAlertState(null);
    forgetPasswordMutation.mutate(data);
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
            <Image src="./ic-lock.svg" alt="Forget password icon" />
            <Heading
              fontSize={"2xl"}
              fontWeight={"semibold"}
              color={"gray.800"}
              lineHeight={"tall"}
            >
              Forgot Password?
            </Heading>
            <Text fontSize={"sm"} fontWeight={"medium"} color={"gray.500"}>
              No worries, we&apos;ll send you reset instructions.
            </Text>
          </Stack>
          <Stack gap={12} mt={8}>
            <FormControl display="flex" flexDirection="column" gap={4}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                Email
              </FormLabel>
              <InputGroup
                startElement={
                  <Button disabled variant={"ghost"} w={"48px"} h={"48px"}>
                    <Icon as={Mail} color="gray.400" size={"md"} />
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
                  placeholder="Enter your email"
                  _placeholder={{
                    fontSize: "md",
                    fontWeight: "normal",
                    color: "gray.400",
                  }}
                  {...forgetPassword("email")}
                />
              </InputGroup>
              {errors.email && (
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              )}
            </FormControl>

            <Stack gap={4}>
              <Button
                bg="purple.600"
                height="48px"
                borderRadius="6px"
                fontSize="lg"
                fontWeight="semibold"
                color="white"
                _hover={{ bg: "purple.500" }}
                onClick={handleSubmit(onSubmit)}
                loading={isSubmitting || forgetPasswordMutation.isPending}
                disabled={
                  !isValid || isSubmitting || forgetPasswordMutation.isPending
                }
                loadingText="Sending Email..."
                spinnerPlacement="end"
              >
                Reset Password
              </Button>

              <Center>
                <Link
                  href="/signin"
                  fontSize="lg"
                  fontWeight="semibold"
                  color="purple.600"
                  gap={2}
                  display="inline-flex"
                  alignItems="center"
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
                  <Icon as={MoveLeft} boxSize={6} strokeWidth={2} />
                  Back to Sign in
                </Link>
              </Center>
            </Stack>
          </Stack>
        </Box>

        {/* Alert below the card for success or error */}
        {alertState && (
          <Alert.Root
            status={alertState.status}
            bg={alertState.status === "success" ? "green.50" : "red.50"}
            border={"1px solid"}
            borderColor={alertState.status === "success" ? "green.200" : "red.200"}
            w={"md"}
            rounded={"lg"}
            p={6}
          >
            <Alert.Indicator />
            <Stack gap={1}>
              <Alert.Title>{alertState.title}</Alert.Title>
              {alertState.description && (
                <Alert.Description>{alertState.description}</Alert.Description>
              )}
            </Stack>
          </Alert.Root>
        )}
      </Stack>
    </Flex>
  );
}

export default ForgotPasswordCard;
