import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Search,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  BookOpen,
} from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
  calculationsCount?: number;
  scenariosCount?: number;
}

interface FeedbackData {
  id: string;
  message: string;
  timestamp: Date;
  userAgent: string;
}

interface CalculationStats {
  totalCalculations: number;
  averageSemesters: number;
  averageTuition: number;
  totalUsers: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "feedback" | "analytics">("users");

  // Users state
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackData[]>([]);
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);

  // Analytics state
  const [stats, setStats] = useState<CalculationStats>({
    totalCalculations: 0,
    averageSemesters: 0,
    averageTuition: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        navigate("/signin");
        return;
      }

      try {
        // Check if user has admin custom claim (set server-side)
        const idTokenResult = await currentUser.getIdTokenResult();

        if (!idTokenResult.claims.admin) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/dashboard");
          return;
        }

        // User is admin, load data
        loadAdminData();
      } catch (error) {
        console.error("Error checking admin access:", error);
        toast.error("Access denied.");
        navigate("/dashboard");
      }
    };

    checkAdminAccess();
  }, [currentUser, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadFeedback(), loadAnalytics()]);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // In a real app, you'd have a users collection in Firestore
      // For now, we'll load users from Auth (you'll need to set up Cloud Functions for this)
      // This is a placeholder - you should create a users collection when users sign up
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData: UserData[] = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || "",
          displayName: data.displayName || "Unknown User",
          photoURL: data.photoURL,
          createdAt: data.createdAt?.toDate(),
          lastLoginAt: data.lastLoginAt?.toDate(),
          calculationsCount: data.calculationsCount || 0,
          scenariosCount: data.scenariosCount || 0,
        };
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const loadFeedback = async () => {
    try {
      const feedbackQuery = query(
        collection(db, "feedback"),
        orderBy("timestamp", "desc")
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData: FeedbackData[] = feedbackSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message || "",
          timestamp: data.timestamp?.toDate() || new Date(),
          userAgent: data.userAgent || "Unknown",
        };
      });

      setFeedback(feedbackData);
      setFilteredFeedback(feedbackData);
    } catch (error) {
      console.error("Error loading feedback:", error);
      toast.error("Failed to load feedback");
    }
  };

  const loadAnalytics = async () => {
    try {
      // Load all calculations to compute stats
      const calculationsSnapshot = await getDocs(collection(db, "calculations"));
      const calculations = calculationsSnapshot.docs.map((doc) => doc.data());

      const totalCalculations = calculations.length;
      const averageSemesters =
        calculations.length > 0
          ? calculations.reduce((sum, calc) => sum + (parseInt(calc.semestersLeft) || 0), 0) /
            calculations.length
          : 0;
      const averageTuition =
        calculations.length > 0
          ? calculations.reduce((sum, calc) => sum + (parseFloat(calc.tuition) || 0), 0) /
            calculations.length
          : 0;

      // Get unique user IDs
      const uniqueUsers = new Set(calculations.map((calc) => calc.userId));

      setStats({
        totalCalculations,
        averageSemesters: Math.round(averageSemesters * 10) / 10,
        averageTuition: Math.round(averageTuition),
        totalUsers: uniqueUsers.size,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    }
  };

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query);
    if (query.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.displayName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleFeedbackSearch = (query: string) => {
    setFeedbackSearchQuery(query);
    if (query.trim() === "") {
      setFilteredFeedback(feedback);
    } else {
      const filtered = feedback.filter((fb) =>
        fb.message.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFeedback(filtered);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "feedback", feedbackId));
      setFeedback(feedback.filter((fb) => fb.id !== feedbackId));
      setFilteredFeedback(filteredFeedback.filter((fb) => fb.id !== feedbackId));
      toast.success("Feedback deleted successfully");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleViewFeedback = (fb: FeedbackData) => {
    setSelectedFeedback(fb);
    setShowFeedbackDetails(true);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
          <h1 className="text-3xl font-bold text-heading">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage users, feedback, and analytics</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex gap-4 md:gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "users"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-5 h-5" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "feedback"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Feedback
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "analytics"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="pl-10 w-full md:w-80"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Calculations</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.uid}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>{user.calculationsCount || 0}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold">User Feedback</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={feedbackSearchQuery}
                  onChange={(e) => handleFeedbackSearch(e.target.value)}
                  className="pl-10 w-full md:w-80"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Feedback ({filteredFeedback.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No feedback found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFeedback.map((fb) => (
                          <TableRow key={fb.id}>
                            <TableCell className="max-w-md truncate">
                              {fb.message}
                            </TableCell>
                            <TableCell>{formatDate(fb.timestamp)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewFeedback(fb)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFeedback(fb.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active platform users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Calculations
                  </CardTitle>
                  <BookOpen className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalCalculations}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Budget plans created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg. Semesters
                  </CardTitle>
                  <Calendar className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averageSemesters}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per calculation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg. Tuition
                  </CardTitle>
                  <DollarSign className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${stats.averageTuition.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per year
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  More detailed analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about this user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-medium">{selectedUser.displayName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-base font-mono text-sm">{selectedUser.uid}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Joined Date
                </label>
                <p className="text-base">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <p className="text-base">{formatDate(selectedUser.lastLoginAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Calculations Created
                </label>
                <p className="text-base">{selectedUser.calculationsCount || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Scenarios Created
                </label>
                <p className="text-base">{selectedUser.scenariosCount || 0}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Details Dialog */}
      <Dialog open={showFeedbackDetails} onOpenChange={setShowFeedbackDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>Full feedback message</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <p className="text-base mt-1 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Submitted At
                </label>
                <p className="text-base">{formatDate(selectedFeedback.timestamp)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User Agent
                </label>
                <p className="text-sm text-muted-foreground break-all">
                  {selectedFeedback.userAgent}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteFeedback(selectedFeedback.id);
                    setShowFeedbackDetails(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
