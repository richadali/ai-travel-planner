"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  RefreshCcw,
  ArrowUpDown,
  UserCircle,
  Mail,
  Calendar,
  Clipboard,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: string;
  _count: {
    trips: number;
    sessions: number;
    accounts: number;
  };
  stats: {
    generatedTrips: number;
    savedTrips: number;
    sharedTrips: number;
    downloadedTrips: number;
  };
}

interface PaginationData {
  page: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  hasMore: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    totalUsers: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const debouncedSearch = useDebounce(search, 500);

  // Function to fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy,
        sortDirection,
      });
      
      if (debouncedSearch) {
        queryParams.set("search", debouncedSearch);
      }
      
      const response = await fetch(`/api/admin/users?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, sortBy, sortDirection, debouncedSearch]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };
  
  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page on search
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">User Management</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Manage and view all registered users in the system
              </p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchUsers()}
                disabled={loading}
                className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Table */}
          <Card className="border-0 overflow-hidden bg-white dark:bg-slate-900 shadow-md">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Registered Users
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {pagination.totalUsers} total users
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="w-[80px]">Avatar</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => handleSort("name")}
                        >
                          <span>Name</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => handleSort("email")}
                        >
                          <span>Email</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => handleSort("createdAt")}
                        >
                          <span>Joined</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">Generated</TableHead>
                      <TableHead className="text-center">Saved</TableHead>
                      <TableHead className="text-center">Shared</TableHead>
                      <TableHead className="text-center">Downloaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeletons
                      Array.from({ length: pagination.pageSize }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>{(pagination.page - 1) * pagination.pageSize + index + 1}</TableCell>
                          <TableCell>
                            <Skeleton className="h-10 w-10 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-[150px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-[200px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-[100px]" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-[30px] mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-[30px] mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-[30px] mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-[30px] mx-auto" />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-start space-x-2">
                              <Skeleton className="h-8 w-8 rounded" />
                              <Skeleton className="h-8 w-8 rounded" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                            <UserCircle className="h-12 w-12 mb-2" />
                            <h3 className="font-medium text-lg mb-1">No users found</h3>
                            <p className="text-sm">
                              {search ? "Try a different search term" : "No users have registered yet"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Actual user data
                      users.map((user, index) => (
                        <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>{(pagination.page - 1) * pagination.pageSize + index + 1}</TableCell>
                          <TableCell>
                            {user.image ? (
                              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                <Image
                                  src={user.image}
                                  alt={user.name || "User"}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-slate-400 dark:text-slate-300" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {user.name || <span className="text-slate-400 italic">No name</span>}
                          </TableCell>
                          <TableCell className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="text-sm truncate max-w-[200px]">{user.email}</span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={user.stats.generatedTrips > 0 ? "default" : "outline"} className="font-medium">
                              {user.stats.generatedTrips}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={user.stats.savedTrips > 0 ? "default" : "outline"} className="font-medium">
                              {user.stats.savedTrips}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={user.stats.sharedTrips > 0 ? "secondary" : "outline"} className="font-medium">
                              {user.stats.sharedTrips}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={user.stats.downloadedTrips > 0 ? "success" : "outline"} className="font-medium">
                              {user.stats.downloadedTrips}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-start space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View generated itineraries"
                                onClick={() => router.push(`/admin/user-trips/${user.id}`)}
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Copy user ID"
                                onClick={() => {
                                  navigator.clipboard.writeText(user.id);
                                  alert(`User ID copied: ${user.id.substring(0, 8)}...`);
                                }}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  <span className="font-medium">
                    {users.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalUsers)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalUsers}</span> users
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1 || loading}
                    className="h-8 w-8"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center px-2">
                    <span className="text-sm font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="h-8 w-8"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 