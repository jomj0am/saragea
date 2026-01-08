"use client";

import { useState } from "react";
import {
  type User,
  type Lease,
  type Room,
  type Property,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Shield, User as UserIcon, Home, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import MultiImageUploader from "@/components/admin/shared/MultiImageUploader";
import Lottie from "lottie-react";
import securityamnation from "../../../../../public/lottie/secure.json";

type ProfileUser = User & {
  leases: (Lease & { room: Room & { property: Property } })[];
  _count: { maintenanceTickets: number; invoices: number };
};

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const t = useTranslations("ProfilePage");
  const { update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Simple state for the edit form
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    image: user.image || "",
  });

  // Password State
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await update({ name: formData.name, image: formData.image }); // Update session
      toast({
        title: "Profile Updated",
        description: "Your details have been saved.",
      });
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passData.current,
          newPassword: passData.new,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      setPassData({ current: "", new: "", confirm: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="md:h-screen bg-secondary/30 pb-20 -mt-16 pt-16">
      {/* 1. Cinematic Header */}
      <div className="relative h-80 md:h-80 w-full overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-600/80 opacity-90" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "url('/assets/patterns/grid.jpg')" }}
        />

        {/* User Info Overlay */}
        <div className="absolute bottom-0 mx-auto  left-0 w-full p-8 ">
          <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={formData.image} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-muted">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {/* Hidden trigger for image upload could go here */}
              </div>

              <div className="text-white mb-2 flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                    {user.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="backdrop-blur-md bg-white/20 text-white border-none"
                  >
                    {isAdmin ? t("roleLabel.ADMIN") : t("roleLabel.TENANT")}
                  </Badge>
                </div>
                <p className="text-white/80 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {user.email}
                </p>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="flex gap-4 text-white">
              <div className="text-center px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-xs uppercase tracking-wider opacity-70">
                  Tickets
                </p>
                <p className="text-xl font-bold">
                  {user._count.maintenanceTickets}
                </p>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-xs uppercase tracking-wider opacity-70">
                  Invoices
                </p>
                <p className="text-xl font-bold">{user._count.invoices}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-background/50 backdrop-blur-sm rounded-xl border">
            <TabsTrigger value="overview" className="rounded-lg">
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="edit" className="rounded-lg">
              {t("tabs.edit")}
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg">
              {t("tabs.security")}
            </TabsTrigger>
          </TabsList>

          {/* --- Overview Tab --- */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-muted-foreground text-sm">
                      Full Name
                    </span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-muted-foreground text-sm">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-muted-foreground text-sm">
                      Member Since
                    </span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Active Lease Info (Only if tenant) */}
              {!isAdmin && user.leases[0] && (
                <Card className="border-l-4 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" /> Current
                      Residence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {user.leases[0].room.property.name}
                      </p>
                      <p className="text-muted-foreground">
                        Room {user.leases[0].room.roomNumber}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      Lease Active until{" "}
                      {new Date(user.leases[0].endDate).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {isAdmin && (
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" /> Admin Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="opacity-80">
                      You have full access to manage properties, tenants, and
                      system settings.
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-4 w-full"
                      onClick={() => router.push("/admin")}
                    >
                      Go to Admin Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* --- Edit Profile Tab --- */}
          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>{t("tabs.edit")}</CardTitle>
                <CardDescription>
                  Update your public profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={formData.image} />
                          <AvatarFallback>
                            {formData.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Reusing existing uploader logic or simple URL input for now */}
                        <MultiImageUploader
                          value={formData.image ? [formData.image] : []}
                          onChange={(urls) =>
                            setFormData({ ...formData, image: urls[0] || "" })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("form.nameLabel")}</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            className="pl-10"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("form.emailLabel")}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            className="pl-10"
                            value={formData.email}
                            disabled // Email change usually requires verification logic
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <LoadingButton type="submit" loading={isLoading}>
                      {t("form.saveBtn")}
                    </LoadingButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Security Tab --- */}
          <TabsContent value="security">
            <Card>
              <div className="grid md:grid-cols-2  items-center">
                <div>
                  <CardHeader>
                    <CardTitle>{t("tabs.security")}</CardTitle>
                    <CardDescription>
                      Manage your password and account security.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleUpdatePassword}
                      className="space-y-4 max-w-md"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="current">{t("form.currentPass")}</Label>
                        <Input
                          id="current"
                          type="password"
                          value={passData.current}
                          onChange={(e) =>
                            setPassData({
                              ...passData,
                              current: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">{t("form.newPass")}</Label>
                        <Input
                          id="new"
                          type="password"
                          value={passData.new}
                          onChange={(e) =>
                            setPassData({ ...passData, new: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">{t("form.confirmPass")}</Label>
                        <Input
                          id="confirm"
                          type="password"
                          value={passData.confirm}
                          onChange={(e) =>
                            setPassData({
                              ...passData,
                              confirm: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="pt-2">
                        <LoadingButton type="submit" loading={isLoading}>
                          {t("form.changePassBtn")}
                        </LoadingButton>
                      </div>
                    </form>
                  </CardContent>
                </div>
                <Lottie
                  className=" mx-auto mb-4"
                  animationData={securityamnation}
                  loop
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
