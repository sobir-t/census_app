import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string({ required_error: "email is required." }).email({
    message: "has to be proper email format.",
  }),
  password: z
    .string({ required_error: "password is required." })
    .min(1, {
      message: "minimum 1 character is required.",
    })
    .max(20, {
      message: "Maximum 20 characters.",
    }),
});

export const RegisterUserSchema = z.object({
  email: z.string({ required_error: "email is required." }).email({
    message: "has to be proper email format.",
  }),
  password: z
    .string({ required_error: "password is required." })
    .min(6, {
      message: "minimum 6 character is required.",
    })
    .max(20, {
      message: "Maximum 20 characters.",
    }),
  name: z.string({ required_error: "Name is required." }).min(1, {
    message: "minimum 1 character is required.",
  }),
  image: z.string(),
});

export const UpdateUserSchema = z.object({
  id: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  email: z.string({ required_error: "email is required." }).email({
    message: "has to be proper email format.",
  }),
  name: z
    .string()
    .min(1, {
      message: "minimum 1 character is required.",
    })
    .optional(),
  image: z.string().optional(),
});

export const UpdatePasswordSchema = z.object({
  id: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  oldPassword: z
    .string({ required_error: "old password is required." })
    .min(6, {
      message: "Minimum 6 character required.",
    })
    .max(20, {
      message: "Maximum 20 characters.",
    }),
  newPassword: z
    .string({ required_error: "new password is required." })
    .min(6, {
      message: "Minimum 6 character required.",
    })
    .max(20, {
      message: "Maximum 20 characters.",
    }),
});

export const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

export const AddressSchema = z.object({
  userId: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  address1: z.string({ required_error: "Address 1 is required." }),
  address2: z.string().optional(),
  city: z.string({ required_error: "City is required." }),
  state: z.enum(STATES),
  zip: z.string({ required_error: "zip code is required." }).regex(/^\d{5}$/, { message: "zip code must be 5 digits." }),
});

export const UpdateAddressSchema = z.object({
  userId: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  id: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  address1: z.string({ required_error: "Address 1 is required." }),
  address2: z.string().optional(),
  city: z.string({ required_error: "City is required." }),
  state: z.enum(STATES),
  zip: z.string({ required_error: "zip code is required." }).regex(/^\d{5}$/, { message: "zip code must be 5 digits." }),
});

export const RecordSchema = z.object({
  firstName: z.string({ required_error: "First Name is required." }).regex(/^[a-zA-Z0-9]$/, { message: "Only alphabets and digits are allowed." }),
  lastName: z.string({ required_error: "Last Name is required." }).regex(/^[a-zA-Z0-9]$/, { message: "Only alphabets and digits are allowed." }),
  dob: z.string({ required_error: "Date of birth is required." }).date("Date has to be in YYYY-MM-DD format."),
  ssn: z
    .string()
    .length(9, {
      message: "SSN has to be 9 digits.",
    })
    .regex(/^\d{9}$/, { message: "SSN has to be 9 digits." }),
  addressId: z.number({ required_error: "Address id is required." }),
});

export const UpdateRecordSchema = z.object({
  userId: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  id: z.number({ required_error: "id is required." }).min(1, {
    message: "minimum 1 digit required.",
  }),
  firstName: z.string({ required_error: "First Name is required." }).regex(/^[a-zA-Z0-9]$/, { message: "Only alphabets and digits are allowed." }),
  lastName: z.string({ required_error: "Last Name is required." }).regex(/^[a-zA-Z0-9]$/, { message: "Only alphabets and digits are allowed." }),
  dob: z.string({ required_error: "Date of birth is required." }).date("Date has to be in YYYY-MM-DD format."),
  ssn: z
    .string()
    .length(9, {
      message: "SSN has to be 9 digits.",
    })
    .regex(/^\d{9}$/, { message: "SSN has to be 9 digits." }),
  addressId: z.number({ required_error: "Address id is required." }),
});
