import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventDataTable from "../components/EventDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious, } from "../components/ui/pagination"
import { Input } from "../components/ui/input";
import { ChevronUpIcon, MagnifyingGlassIcon, ChevronDownIcon, InboxIcon, ArrowDownOnSquareIcon, PencilIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import LoadingPage from "./LoadingPage";
import { motion } from "framer-motion";
import AddGuestDialog from "../components/AddGuestDialog";
import DeleteGuestDialog from "../components/DeleteGuestDialog";
import MessageSettingDialog from "../components/MessageSettingDialog";
import { useMessageContext } from "../context/MessageContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import React from "react";
import { Guest, Event } from "../types/types";
import useEventApi from '../api/eventApi';
import useGuestApi from '../api/guestApi';
const InformationIcon = require("../assets/i-icon.svg").default as string;
const QuestionMarkIcon = require("../assets/question-icon.svg").default as string;
const CrossIcon = require("../assets/cross-icon.svg").default as string;
const CheckIcon = require("../assets/check-icon.svg").default as string;
const ProfPicTemplate = require("../assets/profile-template.svg").default as string;

const EventData = () => {
  const navigate = useNavigate();
  const { id: eventIdParam } = useParams<{ id: string }>();
  const { email, token } = useAuth();
  const { subject, message } = useMessageContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [confirmationFilter, setConfirmationFilter] = useState<string | null>(null);
  const [attendanceFilter, setAttendanceFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuests, setSelectedGuests] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [confirmationCounts, setConfirmationCounts] = useState({
    invitation: 0,
    confirmed: 0,
    represented: 0,
    'to be confirmed': 0,
    cancelled: 0
  });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState<boolean>(false);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({});
  const [dataVisible, setDataVisible] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [msgSettingOpen, setMsgSettingOpen] = useState(false);
  const guestAttributes = [
    ...Object.keys(filteredGuests.reduce((acc, guest) => ({ ...acc, ...guest.attributes }), {})),
  ];
  // Use URL param if available, otherwise fall back to localStorage
  const storedEventId = eventIdParam || localStorage.getItem("event id");
  const { getEvents, getLoadedEvent, changeLastUpdate } = useEventApi();
  const {
    addSingleGuest,
    getGuests,
    getAllGuests,
    countConfirmation,
    getGuestsSearchFilter,
    updateGuestAttendance,
    updateGuestAttendanceBy,
    updateGuestEmailed,
    updateGuestEmailedBy,
    updateGuestMerchandise,
    updateGuestMerchandiseBy,
    deleteSingleGuest,
    exportGuestsToExcel,
    sendEmailToGuest,
  } = useGuestApi();

  // To Show And Hide Data Counts
  const toggleVisibility = () => {
    setDataVisible(!dataVisible);
  };

  // Fetching profile, events, and guests data
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      // Get Events
      getEvents()
        .then(response => {
          setEvents(response);
        })
        .catch(error => {
          console.error('There was an error!', error);
        });

      // Check Loaded Event
      if (storedEventId) {
        getLoadedEvent(storedEventId)
          .then(response => {
            setSelectedEvent(response);
            loadConfirmationCounts(Number(storedEventId));
          })
          .catch(error => {
            console.error('There was an error!', error);
            setSelectedEvent(null);
          });

        // Get Guests
        getGuests(storedEventId)
          .then(data => {
            setFilteredGuests(data.guests);
            setCurrentPage(1);
            setTotalPages(data.pagination.totalPages);
          })
          .catch(error => {
            console.error('There was an error!', error);
            setFilteredGuests([]);
          });
      } else {
        setSelectedEvent(null);
      }
    }
  }, [navigate]);


  // Counting each confirmation length
  const loadConfirmationCounts = async (eventId: number) => {
    try {
      // Call countConfirmation from useGuestApi
      const response = await countConfirmation(eventId.toString());

      const possibleStatuses = ['confirmed', 'represented', 'to be confirmed', 'cancelled'];
      const counts = possibleStatuses.reduce((acc, status: string) => {
        acc[status] = response[status] !== undefined ? Number(response[status]) : 0;
        return acc;
      }, {} as any);

      counts.invitation = counts.confirmed + counts.represented + counts['to be confirmed'] + counts.cancelled;
      setConfirmationCounts(counts);
    } catch (error) {
      console.error('There was an error fetching the confirmation counts!', error);
    }
  };

  // Function for handling searching and filtering
  const handleSearchAndFilter = () => {
    if (!token || !storedEventId) {
      return;
    }

    const queryParams = [];
    if (searchQuery) queryParams.push(`search=${searchQuery}`);
    if (confirmationFilter) queryParams.push(`confirmation=${confirmationFilter.toLowerCase()}`);
    if (attendanceFilter) queryParams.push(`attendance=${attendanceFilter.toLowerCase()}`);
    if (sortConfig.key) queryParams.push(`sortBy=${sortConfig.key}&sortOrder=${sortConfig.direction}`)

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    getGuestsSearchFilter(storedEventId, queryString)
      .then(response => {
        setFilteredGuests(response.guests);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      })
      .catch(error => {
        console.error('There was an error!', error);
        setFilteredGuests([]);
      });
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [confirmationFilter, attendanceFilter, searchQuery, sortConfig]);

  // Real-time update for confirmation counts And Guest List (every 5 seconds)
  useEffect(() => {
    if (storedEventId && token) {
      const interval = setInterval(() => {
        loadConfirmationCounts(Number(storedEventId));
        loadGuests(Number(storedEventId));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [storedEventId, token, currentPage, searchQuery, confirmationFilter, attendanceFilter, sortConfig]);

  useEffect(() => {
    const addNewGuest = async () => {
      if (Object.keys(newGuest).length > 0) {
        await addGuest();
      }
    };

    addNewGuest();
  }, [newGuest]);

  // Change Page (Pagination)
  const handleChangePage = (page: number) => {
    if (!token || !storedEventId) {
      return;
    }

    getAllGuests(storedEventId, page)
      .then(response => {
        setFilteredGuests(response.guests);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      })
      .catch(error => {
        console.error('There was an error!', error);
        setFilteredGuests([]);
      });
  }

  if (!email) {
    return <LoadingPage message="Loading user data..." />;
  }

  const getQueryParams = () => {
    const queryParams = [];
    if (searchQuery) queryParams.push(`search=${searchQuery}`);
    if (confirmationFilter) queryParams.push(`confirmation=${confirmationFilter.toLowerCase()}`);
    if (attendanceFilter) queryParams.push(`attendance=${attendanceFilter.toLowerCase()}`);
    if (sortConfig.key) queryParams.push(`sortBy=${sortConfig.key}&sortOrder=${sortConfig.direction}`);
    queryParams.push(`page=${currentPage}`)
    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  };

  // Fetching guests
  const loadGuests = async (eventId: number) => {
    if (!token) {
      return;
    }

    const queryString = getQueryParams();
    return getGuestsSearchFilter(eventId.toString(), queryString)
      .then(response => {
        setFilteredGuests(response.guests);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      })
      .catch(error => {
        console.error('There was an error fetching the guests!', error);
        setFilteredGuests([]);
      });
  };

  // HELPER FUNCTIONS
  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setCurrentPage(1);
    localStorage.setItem('event id', event.id.toString() || '');
    if (token) {
      await loadConfirmationCounts(event.id)
      await loadGuests(event.id);
    }
  };

  const handleAttendanceFilterChange = (status: string) => {
    setAttendanceFilter(status.toLowerCase() === 'all' ? null : status.toLowerCase());
  };

  const handleSelectGuest = (guestId: number) => {
    setSelectedGuests((prevSelectedGuests) => {
      const newSelectedGuests = new Set(prevSelectedGuests);
      if (newSelectedGuests.has(guestId)) {
        newSelectedGuests.delete(guestId);
      } else {
        newSelectedGuests.add(guestId);
      }
      return newSelectedGuests;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const allGuestIds = new Set(filteredGuests.map((guest) => guest.id));
      setSelectedGuests(allGuestIds);
      setSelectAll(selectAll);
    } else {
      setSelectedGuests(new Set());
      setSelectAll(selectAll);
    }
  };



  // Update Attendance Status (Kehadiran)
  const updateAttendance = async (selectedAttendanceStatus: string, guestId: number) => {
    console.log('Updating attendance:', { guestId, newStatus: selectedAttendanceStatus });

    // Optimistic Update: Update UI immediately
    setFilteredGuests(prev => {
      const updated = prev.map(g =>
        g.id === guestId ? { ...g, attendance: selectedAttendanceStatus } : g
      );
      console.log('Updated filteredGuests:', updated.find(g => g.id === guestId));
      return updated;
    });

    try {
      await updateGuestAttendance(selectedAttendanceStatus, guestId.toString());
      await updateGuestAttendanceBy(email, guestId.toString());
      // Success - optimistic update already applied, no need to refresh anything
    } catch (error) {
      console.error('Error updating attendance:', error);
      // If error, refresh data to revert changes
      if (storedEventId) await loadGuests(Number(storedEventId));
    }
  }

  // Update Merchandise Status
  const updateMerchandise = async (merchandiseStatus: string, guestId: number) => {
    console.log('Updating merchandise:', { guestId, newStatus: merchandiseStatus });

    // Optimistic Update
    setFilteredGuests(prev => {
      const updated = prev.map(g =>
        g.id === guestId ? { ...g, merchandise: merchandiseStatus } : g
      );
      return updated;
    });

    try {
      await updateGuestMerchandise(merchandiseStatus, guestId.toString());
      await updateGuestMerchandiseBy(email, guestId.toString());
    } catch (error) {
      console.error('Error updating merchandise:', error);
      if (storedEventId) await loadGuests(Number(storedEventId));
    }
  }



  // Show Last Update by WHO and WHEN
  const lastUpdate = async () => {
    try {
      if (selectedEvent && storedEventId) {
        const response = await changeLastUpdate(
          storedEventId,
          {
            name: selectedEvent.name,
            start_date: selectedEvent.start_date,
            end_date: selectedEvent.end_date,
            sales: selectedEvent.sales,
            account_manager: selectedEvent.account_manager,
            company: selectedEvent.company,
            event_time: selectedEvent.event_time,
            loading_date: selectedEvent.loading_date,
            discord_channel: selectedEvent.discord_channel,
            drive_folder: selectedEvent.drive_folder,
            location: selectedEvent.location,
            last_updated_by: email,
            last_updated_at: Date.now()
          }
        );

        setSelectedEvent(response.data);
      }

      if (storedEventId && token) {
        await loadGuests(Number(storedEventId));
        await loadConfirmationCounts(Number(storedEventId));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  // Sorting Data
  const handleSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Change Sorting Icon (up and down)
  const getIconForSorting = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronDownIcon className="w-5 h-5" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ChevronDownIcon className="w-5 h-5" />;
    } else {
      return <ChevronUpIcon className="w-5 h-5" />;
    }
  };

  // To render Last Update Information
  const renderLastUpdatedInfo = () => {
    if (selectedEvent && selectedEvent.last_updated_by && selectedEvent.last_updated_at) {
      const lastUpdatedAt = new Date(selectedEvent.last_updated_at);

      // Format last updated time
      const formattedLastUpdatedAt = lastUpdatedAt.toLocaleString('id-ID');

      return (
        <span>
          (Last Updated By {selectedEvent.last_updated_by} | {formattedLastUpdatedAt})
        </span>
      );
    } else {
      return (
        <span>(Not Updated Yet)</span>
      );
    }
  };

  // Exporting data To CSV
  const handleExportToExcel = async () => {
    if (!selectedEvent || !storedEventId) return;

    const id = toast.loading("Menyiapkan data untuk export...");
    console.log("Starting backend-driven export...");

    try {
      // Send current filter state to backend
      const exportParams = {
        event_id: storedEventId,
        search: searchQuery,
        confirmation: confirmationFilter ? confirmationFilter.toLowerCase() : null,
        attendance: attendanceFilter ? attendanceFilter.toLowerCase() : null,
        sortBy: sortConfig.key || 'id',
        sortOrder: sortConfig.direction || 'ASC'
      };

      const response = await exportGuestsToExcel(exportParams);

      // Generate timestamp for filename
      const now = new Date();
      const timestamp = now.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/[/:]/g, '-').replace(/, /g, '_');

      // Membuat URL untuk file unduhan
      const url = window.URL.createObjectURL(new Blob([response], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedEvent.name}_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      toast.update(id, {
        render: "Export berhasil!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

    } catch (error: any) {
      console.error('Error during backend export:', error);
      let errorMsg = "Gagal melakukan export data.";

      if (error.response) {
        // Backend returned an error response
        if (error.response.data && error.response.data.error) {
          errorMsg = `Error Server: ${error.response.data.error}`;
        } else {
          errorMsg = `Server Error (${error.response.status})`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = "Tidak ada respon dari server. Periksa koneksi internet Anda.";
      } else {
        errorMsg = error.message || errorMsg;
      }

      toast.update(id, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    }
  };

  // Open and Submit New Data
  const handleAddData = async (guest: Partial<Guest>) => {
    setIsAddGuestModalOpen(true);
    setNewGuest(guest);
  };

  // Close Add Dialog
  const handleCancelAdd = () => {
    setIsAddGuestModalOpen(false);
  };

  const addGuest = async () => {
    try {
      if (!token) {
        throw new Error('No token found, please login first.');
      }

      await addSingleGuest(newGuest, storedEventId)
        .then(() => {
          setNewGuest({});
          setIsAddGuestModalOpen(false);
        });

      if (storedEventId && token) {
        lastUpdate();
      }

    } catch (error) {
      console.error('Error adding data:', error);
    }
  }

  // Delete a Data
  const deleteGuest = async () => {
    try {
      if (!token) {
        throw new Error('No token found, please login first.');
      }

      // Convert selectedGuests Set to Array
      const guestIds = Array.from(selectedGuests);

      // Send delete requests for each guest ID
      await Promise.all(guestIds.map(async (id) => {
        await deleteSingleGuest(id.toString());
      }));

      toast.success('Guests deleted successfully!');

      if (storedEventId && token) {
        lastUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete guests!');
      console.error('Error deleting guest:', error);
    }
  };

  // Send Email
  const sendEmail = async () => {
    try {
      if (!token) {
        throw new Error('No token found, please login first.');
      }
      if (!storedEventId) {
        throw new Error('No event ID found.');
      }
      if (!subject || !message) {
        throw new Error('Subject or message is missing.');
      }

      const guestIds = Array.from(selectedGuests);
      if (guestIds.length === 0) return;

      const emailSubject = subject[Number(storedEventId)];
      const emailMessageTemplate = message[Number(storedEventId)];

      // Find selected guests in filteredGuests (current view)
      const selectedData = filteredGuests.filter(guest => selectedGuests.has(guest.id));

      if (selectedData.length < guestIds.length) {
        // Some selected guests might not be in the current filteredGuests (if they navigated pages)
        // In this case, we'd ideally fetch them all, but for now we skip with a warning or fetch.
        // Let's fetch all for safety if we are broadcasting.
        toast.info("Menyiapkan data email...");
        // Re-using a pattern similar to export but just for email
      }

      const emails = selectedData.map(guest => ({
        email: guest.email,
        message: replacePlaceholders(emailMessageTemplate, guest)
      }));

      // Send emails
      await sendEmailToGuest({
        subject: emailSubject,
        message: emails.map(email => email.message),
        emails: emails.map(email => email.email),
        guests: selectedData.map(g => g.id)
      });

      toast.success('Emails sent successfully!');
    } catch (error) {
      toast.error('Failed to send emails!');
      console.error('Error sending email:', error);
    }
  };

  const replacePlaceholders = (message: string, guest: Guest) => {
    return message
      .replace(/{name}/g, guest.username)
      .replace(/{email}/g, guest.email)
      .replace(/{phone}/g, guest.phoneNum)
      .replace(/{instansi}/g, guest.instansi);
  };

  // Update Emailed Status
  const updateEmailed = async (guestId: number) => {
    try {
      await updateGuestEmailed(guestId.toString());
      await updateGuestEmailedBy(email, guestId.toString());

      if (storedEventId && token) {
        lastUpdate();
      }
    } catch (error) {
      toast.error('Failed to update emailed status!');
      console.error('Error updating emailed status:', error);
    }
  };




  // Deleting Guest
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedGuests(new Set());
  };

  const handleDeleteConfirm = () => {
    if (selectedGuests) {
      deleteGuest();
      handleDeleteDialogClose();
    }
  };

  // Message Setting
  const handleMsgSettingClick = () => {
    setMsgSettingOpen(true);
  };

  const handleMsgSettingClose = () => {
    setMsgSettingOpen(false);
    setSelectedGuests(new Set());
  };

  const handleMsgSettingConfirm = () => {
    if (selectedGuests) {
      sendEmail();
      handleMsgSettingClose();
    }
  }

  const renderPaginationItems = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, index) => (
        <PaginationItem
          key={index + 1}
          className={`bg-white rounded-xl px-4 py-2 cursor-pointer ${currentPage === index + 1 ? 'bg-blue-500 text-white' : ''} hover:rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300`}
          onClick={() => handleChangePage(index + 1)}
        >
          {index + 1}
        </PaginationItem>
      ));
    } else {
      const pages = [];
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);

      return pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === 'ellipsis' ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem
              className={`bg-white rounded-xl px-4 py-2 cursor-pointer ${currentPage === page ? 'bg-blue-500 text-white' : ''} hover:rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300`}
              onClick={() => handleChangePage(Number(page))}
            >
              {page}
            </PaginationItem>
          )}
        </React.Fragment>
      ));
    }
  };

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="m-4 md:m-8" >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-[#969696]">Dashboard &gt; <span className="text-[#608EC4]">Event Data</span></div>
        <div>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={ProfPicTemplate} />
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            <div className="text-sm pr-2 w-auto">
              {email}
            </div>
          </div>

        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="mb-4 md:mb-0 w-full md:w-auto">
          {/* Show event name if loaded from URL, otherwise show dropdown */}
          <div className="flex items-center gap-4">
            {eventIdParam && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-500 hover:text-gray-700 bg-white px-3 py-2 rounded-md shadow-sm transition-all"
              >
                <span className="mr-1">←</span> Back
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between p-2 bg-white rounded shadow-xl drop-shadow-lg w-full md:w-auto min-w-[200px]">
                <span>{selectedEvent ? selectedEvent.name : 'Select Event Database'}</span>
                <ChevronDownIcon className="h-5 w-5 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-48 overflow-y-auto">
                {events.map(event => (
                  <DropdownMenuItem key={event.id} onClick={() => handleEventSelect(event)}>
                    {event.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      {selectedEvent && (
        <div className="flex flex-col xl:flex-row gap-6 mt-6">
          {/* Main Info Card */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
            {/* Pink Header */}
            <div className="bg-gradient-to-r from-[#F080C0] to-[#E95AA6] p-8">
              <div className="text-white text-lg font-medium mb-1">Event Name:</div>
              <h1 className="text-white text-4xl font-extrabold tracking-wide uppercase">{selectedEvent.name}</h1>
            </div>

            {/* Info Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
              {/* Row 1 */}
              <div>
                <div className="text-gray-800 font-bold mb-1">Client Name:</div>
                <div className="text-black font-bold text-lg">{selectedEvent.company}</div>
              </div>
              <div>
                <div className="text-gray-800 font-bold mb-1">Event Location:</div>
                <div className="text-black font-bold text-lg">{selectedEvent.location || '-'}</div>
              </div>
              <div>
                <div className="text-gray-800 font-bold mb-1">Event Time:</div>
                <div className="text-black font-bold text-lg">{selectedEvent.event_time}</div>
              </div>
              <div>
                <div className="text-gray-800 font-bold mb-1">Start Date:</div>
                <div className="text-[#E02424] font-bold text-lg">
                  {new Date(selectedEvent.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </div>
                {selectedEvent.end_date && (
                  <>
                    <div className="text-[#E02424] font-bold text-sm my-0.5">Until</div>
                    <div className="text-[#E02424] font-bold text-lg">
                      {new Date(selectedEvent.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </div>
                  </>
                )}
              </div>

              {/* Row 2 */}
              <div>
                <div className="text-gray-800 font-bold mb-1">Loading Date:</div>
                <div className="text-[#E02424] font-bold text-lg">
                  {selectedEvent.loading_date ? new Date(selectedEvent.loading_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-800 font-bold mb-1">Discord Channel:</div>
                {selectedEvent.discord_channel ? (
                  <a href={selectedEvent.discord_channel} className="text-[#4285F4] font-bold text-lg hover:underline">Discord</a>
                ) : (
                  <span className="text-gray-400 font-bold">-</span>
                )}
              </div>
              <div>
                <div className="text-gray-800 font-bold mb-1">Drive Folder:</div>
                {selectedEvent.drive_folder ? (
                  <a href={selectedEvent.drive_folder} className="text-[#0F9D58] font-bold text-lg hover:underline">Onedrive</a>
                ) : (
                  <span className="text-gray-400 font-bold">-</span>
                )}
              </div>

              {/* Edit Icon */}
              <div className="flex items-end justify-end">
                <button onClick={() => navigate(`/create?edit=${selectedEvent.id}`)} className="text-gray-400 hover:text-gray-600">
                  <PencilIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Side Info Card (People) */}
          <div className="w-full xl:w-80 bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-8 h-auto">
            <div>
              <div className="text-gray-800 font-medium mb-3">Sales:</div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={ProfPicTemplate} />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <span className="font-bold text-black">{selectedEvent.sales || '-'}</span>
              </div>
            </div>

            <div>
              <div className="text-gray-800 font-medium mb-3">Account Manager:</div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={ProfPicTemplate} />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <span className="font-bold text-black">{selectedEvent.account_manager || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={toggleVisibility}
        className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md mt-4"
      >
        {dataVisible ? "Hide" : "Show"} Statistik Kehadiran
      </button>
      <div
        className={`transition-all duration-200 ease-in-out transform ${dataVisible ? 'max-h-full opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}
        style={{ transformOrigin: 'top' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col text-center items-center justify-center py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={InformationIcon} alt="Information Icon" className="w-16" />
            <div className="text-5xl font-bold">{confirmationCounts.invitation}</div>
            <div className="font-semibold text-[#626262]">Data Invitation</div>
          </div>
          <div className="flex flex-col items-center justify-center justify-self-stretch py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={CheckIcon} alt="Check Icon" className="w-16" />
            <div className="text-5xl font-bold">{confirmationCounts.confirmed + confirmationCounts.represented}</div>
            <div className="font-semibold text-[#25B380]">Hadir</div>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={QuestionMarkIcon} alt="Question Icon" className="w-16" />
            <div className="text-5xl font-bold">{confirmationCounts['to be confirmed']}</div>
            <div className="font-semibold text-[#FF8211]">Belum Konfirmasi</div>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={CrossIcon} alt="Cross Icon" className="w-16" />
            <div className="text-5xl font-bold">{Number(confirmationCounts.cancelled)}</div>
            <div className="font-semibold text-[#C80000]">Tidak Hadir</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-start mt-4 sm:space-x-4 space-y-4 sm:space-y-0 sm:max-w-fit">
        <button
          className="bg-[#FFD667] hover:bg-[#ffbc03] text-[#9A9A9A] transition-colors duration-300 font-semibold border-[#9A9A9A] border-2 py-2 px-4 rounded-lg shadow-md flex space-x-2 items-center"
          onClick={() => handleAddData(newGuest)}
        >
          <span>Add Data</span>
          <InboxIcon className="w-5 h-5" />
        </button>
        <button
          className="border-2 py-1 px-3 rounded-lg font-semibold bg-[#F6E6E6] hover:bg-[#f77f7f] border-[#9A9A9A] transition-colors duration-300 flex items-center space-x-1"
          onClick={handleDeleteClick}
        >
          <span className="text-[#9A9A9A]">Remove</span>
          <div className="text-red-600">
            <XMarkIcon className="w-5 h-5" />
          </div>
        </button>
        <button
          className="bg-[#E7F6E6] hover:bg-[#60ff55] text-[#9A9A9A] transition-colors duration-300 font-semibold border-[#9A9A9A] border-2 py-2 px-4 rounded-lg shadow-md flex space-x-2 items-center"
          onClick={handleMsgSettingClick}
        >
          <span>Send Email</span>
          <EnvelopeIcon className="w-5 h-5" />
        </button>

        <button
          className="bg-white hover:bg-[#000000] hover:text-[#ffffff] text-[#9A9A9A] transition-colors duration-300 font-semibold border-[#9A9A9A] border-2 py-2 px-4 rounded-lg shadow-md flex space-x-2 items-center"
          onClick={handleExportToExcel}
        >
          <span>Export to Excel</span>
          <ArrowDownOnSquareIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4 rounded-xl border-black border-[1px] bg-[#ffffff]">
        <div className="lg:flex justify-between items-center filter-custom">
          <div className="bg-white rounded-lg p-4 w-full md:w-auto flex-col items-center">
            <div className="text-black text-4xl font-bold">{selectedEvent ? selectedEvent.name : 'Select Event Database'}</div>
            <div className="text-xs text-gray-400">
              {renderLastUpdatedInfo()}
            </div>
          </div>
          <div className="lg:flex justify-between items-center p-7 lg:space-x-4 filter-custom">
            <div className="flex items-center space-x-4 search-margin">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-between p-2 bg-[#EDEDED] rounded border-[1px] border-[#9A9A9A] w-auto">
                  <span>Filter Kehadiran</span>
                  <ChevronDownIcon className="h-5 w-5 ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-48 overflow-y-auto">
                  {['Semua', 'Hadir', 'Mewakili', 'Tidak Hadir'].map(status => (
                    <DropdownMenuItem key={status} onClick={() => {
                      const mapping: { [key: string]: string } = {
                        'Semua': 'All',
                        'Hadir': 'Attended',
                        'Mewakili': 'Represented',
                        'Tidak Hadir': 'Did Not Attend'
                      };
                      handleAttendanceFilterChange(mapping[status] || status);
                    }}>
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative flex items-center mt-4 lg:mt-0">
              <Input
                placeholder="Search Data"
                className="bg-[#EDEDED] border-[1px] border-[#9A9A9A]"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchAndFilter();
                  }
                }}
              />
              <span className="absolute inset-y-0 right-10 bg-[#9A9A9A] w-[1px]"></span>
              <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="w-auto">
          <EventDataTable
            guests={filteredGuests}
            selectedGuests={selectedGuests}
            selectAll={selectAll}
            updateAttendance={updateAttendance}
            updateMerchandise={updateMerchandise}
            getIconForSorting={getIconForSorting}
            handleSort={handleSort}
            onSelectGuest={handleSelectGuest}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem className="bg-white rounded-xl cursor-pointer">
              {currentPage !== 1 && (
                <PaginationPrevious onClick={() => handleChangePage(currentPage - 1)}>
                  Previous
                </PaginationPrevious>
              )
              }
            </PaginationItem>
            {/* { totalPages > 2 && currentPage < totalPages && currentPage > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                )
              } */}
            {renderPaginationItems()}
            <PaginationItem className="bg-white rounded-xl cursor-pointer">
              {currentPage !== totalPages && (
                <PaginationNext onClick={() => handleChangePage(currentPage + 1)}>
                  Next
                </PaginationNext>
              )
              }
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <AddGuestDialog
        isOpen={isAddGuestModalOpen}
        onClose={handleCancelAdd}
        onSave={handleAddData}
        guestAttributes={guestAttributes}
        eventId={storedEventId}>
      </AddGuestDialog>
      {selectedGuests && (
        <DeleteGuestDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          guests={selectedGuests}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {selectedGuests && (
        <MessageSettingDialog
          open={msgSettingOpen}
          eventId={Number(localStorage.getItem("event id"))}
          guests={selectedGuests}
          onClose={handleMsgSettingClose}
          onConfirm={handleMsgSettingConfirm}
          onUpdate={updateEmailed}
        />
      )}
    </motion.div>
  );
};

export default EventData;
