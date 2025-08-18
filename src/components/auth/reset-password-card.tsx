import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  Text,
  Image,
  Center,
  Link,
} from "@chakra-ui/react";
import PasswordInput from "../password-input";
import { useRouter } from "next/navigation";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "../../app/schemas/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../lib/password";
import { toaster } from "../ui/toaster";

interface ResetPasswordProps {
  tokenHash: string;
  forceChange: boolean;
}

export default function ResetPasswordCard({ tokenHash, forceChange }: ResetPasswordProps) {
  const router = useRouter();

  const {
    register: resetPasswordForm,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      action: forceChange ? "force_change" : "forgot",
      new_password: "",
      confirm_password: "",
      token_hash: tokenHash,
    },
  });

  const newPassword = watch("new_password");
  const confirmPassword = watch("confirm_password");

  const passwordValidations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== "",
  };

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toaster.create({ title: "Password reset successfully!" });
      router.push("/signin");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toaster.create({
        title: "Failed to reset password",
        description: err?.response?.data?.message || "Something went wrong",
        type: "error",
      });
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Box w={"md"} rounded={"xl"} bg={"white"} boxShadow={"md"} p={8}>
          {/* 🔹 Lock Icon */}
          <Stack align={"center"}>
            <Image src="./ic-lock.svg" alt="Forget password icon" />
            <Heading
              fontSize={"2xl"}
              fontWeight={"semibold"}
              color={"gray.800"}
            >
              Set new password
            </Heading>
            <Text fontSize={"sm"} fontWeight={"medium"} color={"gray.500"}>
              Create a strong password for your account
            </Text>
          </Stack>

          {/* 🔹 Form */}
          <Stack gap={5} mt={8}>
            {/* New Password */}
            <PasswordInput
              label="New password"
              placeholder="Enter new password"
              {...resetPasswordForm("new_password")}
              error={errors.new_password?.message}
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confim Password"
              placeholder="Confirm new password"
              {...resetPasswordForm("confirm_password")}
              error={errors.confirm_password?.message}
            />

            {/* 🔹 Password Requirements */}
            <Box fontSize="sm" color="gray.600">
              <Text fontSize={"sm"} fontWeight="medium">
                Password Requirements:
              </Text>
              <Stack gap={1} fontWeight="normal">
                <Text
                  color={!passwordValidations.length ? "red.500" : "gray.700"}
                >
                  • Minimum 8 characters
                </Text>
                <Text
                  color={
                    !passwordValidations.uppercase ? "red.500" : "gray.700"
                  }
                >
                  • At least one uppercase letter
                </Text>
                <Text
                  color={!passwordValidations.number ? "red.500" : "gray.700"}
                >
                  • At least one number
                </Text>
                <Text
                  color={!passwordValidations.special ? "red.500" : "gray.700"}
                >
                  • At least one special character
                </Text>
                <Text
                  color={!passwordValidations.match ? "red.500" : "gray.700"}
                >
                  • Passwords must match
                </Text>
              </Stack>
            </Box>

            {/* Reset Password Button */}
            <Button
              bg="purple.600"
              height="48px"
              borderRadius="6px"
              fontSize="lg"
              fontWeight="semibold"
              color="white"
              _hover={{ bg: "purple.500" }}
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting || resetPasswordMutation.isPending}
              disabled={
                !isValid || isSubmitting || resetPasswordMutation.isPending
              }
              loadingText="Reseting Password..."
              spinnerPlacement="end"
            >
              Reset Password
            </Button>

            {/* 🔹 "Remember password? Sign in" */}
            <Center mt={2}>
              <Text fontSize={"sm"} fontWeight={"normal"} color={"gray.600"}>
                Remember your password?{" "}
                <Link
                  href="/signin"
                  as="a"
                  fontWeight={"semibold"}
                  color="purple.600"
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
                  Sign in
                </Link>
              </Text>
            </Center>
          </Stack>
        </Box>
        {resetPasswordMutation.isError && (
          <Text textAlign={"center"} fontSize={"sm"} color={"red.500"}>
            {resetPasswordMutation.error.response?.data?.message ||
              resetPasswordMutation.error.message ||
              "An error occurred during login"}
          </Text>
        )}
      </Stack>
    </Flex>
  );
}
