import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Mail, Phone, MessageSquare, MoreVertical, User, Building, MapPin, PhoneCall, Calendar, Clock, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  lastContact: string;
  tags: string[];
  notes?: string;
  location?: string;
  image?: string;
}

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Inc.',
    jobTitle: 'Marketing Director',
    status: 'customer',
    lastContact: '2023-06-14T11:30:00Z',
    tags: ['VIP', 'Marketing', 'Q2 Goal'],
    notes: 'Interested in our premium plan. Follow up next week.',
    location: 'San Francisco, CA',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 987-6543',
    company: 'TechCorp',
    jobTitle: 'CTO',
    status: 'lead',
    lastContact: '2023-06-10T14:15:00Z',
    tags: ['High Value', 'Tech', 'Enterprise'],
    location: 'New York, NY',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    phone: '+1 (555) 456-7890',
    company: 'DesignHub',
    jobTitle: 'Creative Director',
    status: 'active',
    lastContact: '2023-06-12T09:45:00Z',
    tags: ['Design', 'Creative', 'Agency'],
    location: 'Austin, TX',
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 (555) 234-5678',
    company: 'StartUp Labs',
    jobTitle: 'CEO',
    status: 'lead',
    lastContact: '2023-06-05T16:20:00Z',
    tags: ['Startup', 'Founder', 'Investor'],
    location: 'Seattle, WA'
  },
  {
    id: '5',
    name: 'Jessica Williams',
    email: 'jessica.w@example.com',
    phone: '+1 (555) 876-5432',
    company: 'Global Retail',
    jobTitle: 'Purchasing Manager',
    status: 'customer',
    lastContact: '2023-06-15T10:10:00Z',
    tags: ['Retail', 'Bulk Order', 'Key Account'],
    location: 'Chicago, IL',
    image: 'https://randomuser.me/api/portraits/women/29.jpg'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  lead: 'bg-blue-100 text-blue-800',
  customer: 'bg-purple-100 text-purple-800'
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  lead: 'Lead',
  customer: 'Customer'
};

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || contact.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Pagination
  const indexOfLastContact = currentPage * itemsPerPage;
  const indexOfFirstContact = indexOfLastContact - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your CRM contacts and interactions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contact List */}
        <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="all" 
              className="w-full"
              onValueChange={(value) => {
                setActiveTab(value);
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="customer">Customers</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lead">Leads</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mt-4 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {currentContacts.length > 0 ? (
                currentContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {contact.image ? (
                          <AvatarImage src={contact.image} alt={contact.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{contact.company}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${statusColors[contact.status]}`}
                      >
                        {statusLabels[contact.status]}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No contacts found
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredContacts.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Detail */}
        <div className="lg:col-span-3 space-y-6">
          {selectedContact ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      {selectedContact.image ? (
                        <AvatarImage src={selectedContact.image} alt={selectedContact.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {getInitials(selectedContact.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedContact.name}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={statusColors[selectedContact.status]}
                        >
                          {statusLabels[selectedContact.status]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedContact.jobTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 sm:mt-0">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a 
                            href={`mailto:${selectedContact.email}`} 
                            className="text-sm font-medium hover:text-primary hover:underline"
                          >
                            {selectedContact.email}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <a 
                            href={`tel:${selectedContact.phone}`} 
                            className="text-sm font-medium hover:text-primary hover:underline"
                          >
                            {selectedContact.phone}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="text-sm font-medium">{selectedContact.company}</p>
                        </div>
                      </div>
                      
                      {selectedContact.location && (
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="text-sm font-medium">{selectedContact.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedContact.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          <Plus className="h-3 w-3 mr-1" /> Add Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <PhoneCall className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Outbound Call</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedContact.lastContact)}
                          </p>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Discussed pricing and features. Showed interest in the premium plan.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email Sent</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())}
                          </p>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Follow-up email with product brochure and pricing details.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Meeting Scheduled</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString())}
                          </p>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Demo meeting scheduled for next week.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Notes</h3>
                      <div className="border rounded-lg p-4 bg-muted/20">
                        {selectedContact.notes ? (
                          <p className="text-sm">{selectedContact.notes}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No notes available</p>
                        )}
                        <Button variant="ghost" size="sm" className="mt-2 text-xs h-8">
                          <Plus className="h-3 w-3 mr-1" /> Add Note
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-border/50">
                <div className="flex justify-between w-full">
                  <Button variant="ghost">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline">Edit</Button>
                    <Button>Log Activity</Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur h-full flex items-center justify-center">
              <div className="text-center p-8">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Contact Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a contact from the list to view details
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Contact
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
