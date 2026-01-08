"use client";

import { useState } from "react";
import {
  useForm,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Key,
  Mail,
  CheckCircle2,
  AlertCircle,
  Share2,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { type SafeConfigState } from "@/app/[locale]/(admin)/admin/settings/SettingsTabsClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const configSchema = z.object({
  cloudinary: z.object({
    cloudName: z.string().optional(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
  }),
  resend: z.object({
    apiKey: z.string().optional(),
    fromEmail: z.string().optional(),
  }),
  pusher: z.object({
    appId: z.string().optional(),
    key: z.string().optional(),
    secret: z.string().optional(),
    cluster: z.string().optional(),
  }),
  social: z.object({
    googleClientId: z.string().optional(),
    googleClientSecret: z.string().optional(),
    facebookClientId: z.string().optional(),
    facebookClientSecret: z.string().optional(),
    appleId: z.string().optional(),
    appleSecret: z.string().optional(),
  }),
});

type ConfigFormValues = z.infer<typeof configSchema>;

// --- Helper Components ---

// Generic component that accepts any form schema (T) and any valid key (K)
const PasswordInput = <T extends FieldValues, K extends Path<T>>({
  field,
  placeholder,
}: {
  field: ControllerRenderProps<T, K>;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        // Spread the field props (onChange, onBlur, value, ref)
        {...field}
        // Ensure value is never undefined to avoid uncontrolled input warnings
        value={field.value ?? ""}
        className="pr-10 bg-background/50 backdrop-blur-sm transition-all focus:bg-background"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">Toggle visibility</span>
      </Button>
    </div>
  );
};

const ProviderGuide = ({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) => (
  <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mb-6">
    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    <AlertTitle className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2 text-sm">
      Configure {title}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-xs font-normal underline hover:text-blue-800 dark:hover:text-blue-200 ml-auto"
      >
        Get Keys <ExternalLink className="ml-1 h-3 w-3" />
      </a>
    </AlertTitle>
    <AlertDescription className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-1 leading-relaxed">
      {description}
    </AlertDescription>
  </Alert>
);

// --- Main Component ---

interface SystemConfigEditorProps {
  safeConfig: SafeConfigState;
}

export default function SystemConfigEditor({
  safeConfig,
}: SystemConfigEditorProps) {
  const { toast } = useToast();
  const router = useRouter();

  // const [testingConnection, setTestingConnection] = useState<string | null>(
  //   null
  // );
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ConfigFormValues | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string[] | null>(null);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      cloudinary: {
        cloudName: safeConfig.cloudinary.cloudName,
        apiKey: safeConfig.cloudinary.apiKey,
        apiSecret: "",
      },
      resend: {
        apiKey: "",
        fromEmail: safeConfig.resend.fromEmail,
      },
      pusher: {
        appId: safeConfig.pusher.appId,
        key: safeConfig.pusher.key,
        cluster: safeConfig.pusher.cluster,
        secret: "",
      },
      social: {
        googleClientId: safeConfig.social.google.clientId,
        googleClientSecret: "",
        facebookClientId: safeConfig.social.facebook.clientId,
        facebookClientSecret: "",
        appleId: safeConfig.social.apple.clientId,
        appleSecret: "",
      },
    },
  });

  // 1. Initial Form Submission
  const onFormSubmit = (values: ConfigFormValues) => {
    setPendingValues(values);
    setValidationError(null); // Clear previous errors
    setIsConfirmationOpen(true);
  };

  // 2. The Logic: Validate -> Save
  const handleConfirmedSave = async () => {
    if (!pendingValues) return;

    setIsValidating(true);
    setValidationError(null);

    // Prepare payload for validation & saving (convert empty strings to undefined)
    const cleanValues = {
      cloudinary: {
        ...pendingValues.cloudinary,
        apiSecret: pendingValues.cloudinary.apiSecret || undefined,
      },
      resend: {
        ...pendingValues.resend,
        apiKey: pendingValues.resend.apiKey || undefined,
      },
      pusher: {
        ...pendingValues.pusher,
        secret: pendingValues.pusher.secret || undefined,
      },
      social: {
        ...pendingValues.social,
        googleClientSecret:
          pendingValues.social.googleClientSecret || undefined,
        facebookClientSecret:
          pendingValues.social.facebookClientSecret || undefined,
        appleSecret: pendingValues.social.appleSecret || undefined,
      },
    };

    try {
      // --- STEP 1: VALIDATE ---
      const validationRes = await fetch("/api/admin/validate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanValues), // Send cleaned values
      });

      const validationData = await validationRes.json();

      if (!validationRes.ok || !validationData.success) {
        setValidationError(
          validationData.errors || ["Validation failed. Check your keys."]
        );
        setIsValidating(false);
        return; // STOP here if validation fails
      }

      // --- STEP 2: SAVE (Only if validation passed) ---
      const payload = [
        {
          id: "system.config",
          isEnabled: true,
          jsonContent: cleanValues,
        },
      ];

      const saveRes = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error("Database save failed.");

      toast({
        title: "Configuration Saved",
        description: "System variables updated and verified.",
        variant: "success",
      });

      setIsConfirmationOpen(false); // Close modal on success
      router.refresh();
    } catch {
      setValidationError([
        "An unexpected error occurred during the save process.",
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  const StatusBadge = ({
    isConfigured,
  }: {
    isConfigured: boolean | undefined | string;
  }) =>
    isConfigured ? (
      <Badge
        variant="outline"
        className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1.5 px-3 py-1"
      >
        <CheckCircle2 className="w-3.5 h-3.5" /> Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1.5 px-3 py-1"
      >
        <AlertCircle className="w-3.5 h-3.5" /> Not Configured
      </Badge>
    );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
          <Tabs defaultValue="cloudinary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger
                value="cloudinary"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
              >
                <Cloud className="w-4 h-4 mr-2" /> Cloudinary
              </TabsTrigger>
              <TabsTrigger
                value="resend"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
              >
                <Mail className="w-4 h-4 mr-2" /> Email
              </TabsTrigger>
              <TabsTrigger
                value="pusher"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
              >
                <Key className="w-4 h-4 mr-2" /> Pusher
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
              >
                <Share2 className="w-4 h-4 mr-2" /> Social Auth
              </TabsTrigger>
            </TabsList>

            {/* --- CLOUDINARY TAB --- */}
            <TabsContent value="cloudinary" className="space-y-4">
              <ProviderGuide
                title="Cloudinary"
                url="https://cloudinary.com/console"
                description="Required for uploading property images and documents. Retrieve Cloud Name, API Key, and API Secret from your dashboard."
              />
              <Card>
                <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
                  <div>
                    <CardTitle>Storage Settings</CardTitle>
                    <CardDescription>
                      Manage image assets and optimization.
                    </CardDescription>
                  </div>
                  <StatusBadge
                    isConfigured={safeConfig.cloudinary.isConfigured}
                  />
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      name="cloudinary.cloudName"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cloud Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. dxyz..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="cloudinary.apiKey"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123456789" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="cloudinary.apiSecret"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <PasswordInput
                            field={field}
                            placeholder={
                              safeConfig.cloudinary.hasSecret
                                ? "•••••••••••••••••••• (Configured)"
                                : "Enter API Secret"
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep the current secret.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- RESEND TAB --- */}
            <TabsContent value="resend" className="space-y-4">
              <ProviderGuide
                title="Resend"
                url="https://resend.com/api-keys"
                description="Required for sending emails. Ensure you have verified your domain."
              />
              <Card>
                <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
                  <div>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                      Configure transactional emails.
                    </CardDescription>
                  </div>
                  <StatusBadge isConfigured={safeConfig.resend.isConfigured} />
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <FormField
                    name="resend.fromEmail"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email (From)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="onboarding@resend.dev"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="resend.apiKey"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <PasswordInput
                            field={field}
                            placeholder={
                              safeConfig.resend.hasApiKey
                                ? "re_123... (Configured)"
                                : "re_..."
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep current key.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- PUSHER TAB --- */}
            <TabsContent value="pusher" className="space-y-4">
              <ProviderGuide
                title="Pusher Channels"
                url="https://dashboard.pusher.com/"
                description="Required for real-time chat. Create an app with 'ap2' cluster if possible."
              />
              <Card>
                <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
                  <div>
                    <CardTitle>Realtime Chat</CardTitle>
                    <CardDescription>
                      Pusher Channels configuration.
                    </CardDescription>
                  </div>
                  <StatusBadge isConfigured={safeConfig.pusher.isConfigured} />
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField
                      name="pusher.appId"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="pusher.cluster"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cluster</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ap2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="pusher.key"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="pusher.secret"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret</FormLabel>
                        <FormControl>
                          <PasswordInput
                            field={field}
                            placeholder={
                              safeConfig.pusher.hasSecret
                                ? "•••••••• (Configured)"
                                : "Enter Secret"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- SOCIAL TAB --- */}
            <TabsContent value="social" className="space-y-4">
              <Alert className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 mb-4">
                <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertTitle className="text-orange-700 dark:text-orange-300 text-sm font-semibold">
                  Server Restart Required
                </AlertTitle>
                <AlertDescription className="text-orange-600/80 dark:text-orange-400/80 text-xs">
                  Changes to Social Auth providers will be saved but require a
                  server restart to apply. Social keys are not validated
                  automatically.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>OAuth Providers</CardTitle>
                  <CardDescription>
                    Configure Google, Facebook, and Apple login strategies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Google */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        Google Login
                      </h4>
                      <StatusBadge
                        isConfigured={safeConfig.social.google.isConfigured}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name="social.googleClientId"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="...apps.googleusercontent.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="social.googleClientSecret"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Secret</FormLabel>
                            <FormControl>
                              <PasswordInput
                                field={field}
                                placeholder={
                                  safeConfig.social.google.hasSecret
                                    ? "•••••••• (Configured)"
                                    : "Enter Secret"
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t" />

                  {/* Facebook */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        Facebook Login
                      </h4>
                      <StatusBadge
                        isConfigured={safeConfig.social.facebook.isConfigured}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name="social.facebookClientId"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>App ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="social.facebookClientSecret"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>App Secret</FormLabel>
                            <FormControl>
                              <PasswordInput
                                field={field}
                                placeholder={
                                  safeConfig.social.facebook.hasSecret
                                    ? "•••••••• (Configured)"
                                    : "Enter Secret"
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t" />

                  {/* Apple */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        Apple Login
                      </h4>
                      <StatusBadge
                        isConfigured={safeConfig.social.apple.isConfigured}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name="social.appleId"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service ID (Client ID)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="social.appleSecret"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Private Key</FormLabel>
                            <FormControl>
                              <PasswordInput
                                field={field}
                                placeholder={
                                  safeConfig.social.apple.hasSecret
                                    ? "•••••••• (Configured)"
                                    : "Enter Secret"
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4 border-t">
            <LoadingButton
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-md hover:shadow-lg transition-all px-8"
            >
              Update Configuration
            </LoadingButton>
          </div>
        </form>
      </Form>

      {/* --- Smart Confirmation Modal --- */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <ShieldCheck className="h-6 w-6" />
              <DialogTitle>Validate & Update?</DialogTitle>
            </div>
            <DialogDescription>
              We will verify your connection credentials before saving.
              <br />
              <br />
              <span className="font-semibold text-foreground">Note:</span>{" "}
              Social Login settings cannot be auto-validated and will be saved
              directly.
            </DialogDescription>
          </DialogHeader>

          {/* Validation Error Display */}
          {validationError && (
            <Alert
              variant="destructive"
              className="my-2 border-red-500/50 bg-red-500/10"
            >
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Validation Failed</AlertTitle>
              <AlertDescription className="text-xs list-disc pl-4">
                {validationError.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmationOpen(false)}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleConfirmedSave}
              loading={isValidating}
              className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
            >
              {isValidating ? "Verifying..." : "Yes, Validate & Save"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
