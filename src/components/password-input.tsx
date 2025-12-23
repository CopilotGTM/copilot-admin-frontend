import { useState } from "react";
import { Input, InputGroup, Button, Icon } from "@chakra-ui/react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Eye, EyeOff, KeyRound } from "lucide-react";

interface PassWordInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  // Allow any additional props from React Hook Form's register
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function PasswordInput({
  label = "Password",
  placeholder = "Enter password",
  error = "",
  ...props
}: PassWordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl id="password" display="flex" flexDirection="column" gap={4}>
      <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
        {label}
      </FormLabel>

      <InputGroup
        startElement={
          <Button disabled variant={"ghost"} w={"48px"} h={"48px"} type="button">
            <Icon as={KeyRound} color="gray.400" size={"md"} />
          </Button>
        }
        endElement={
          <Button
            variant="ghost"
            onClick={() => setShowPassword((prev) => !prev)}
            w={"48px"}
            h={"48px"}
            type="button"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </Button>
        }
      >
        <Input
          size={"lg"}
          variant={"outline"}
          borderRadius={6}
          height={"48px"}
          ps={"56px"}
          pe={"56px"}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          _placeholder={{
            fontSize: "md",
            fontWeight: "normal",
            color: "gray.400",
          }}
          {...props}
        />
      </InputGroup>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}
