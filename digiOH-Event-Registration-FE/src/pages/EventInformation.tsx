import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EventProfile from "../components/EventProfile";
import ProfileHolder from "../components/ProfileHolder";
import LoadingPage from "./LoadingPage";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Guest, Event } from "../types/types";
import useEventApi from '../api/eventApi';
import useGuestApi from '../api/guestApi';
const InformationIcon = require("../assets/i-icon.svg").default as string;
const QuestionMarkIcon = require("../assets/question-icon.svg").default as string;
const CrossIcon = require("../assets/cross-icon.svg").default as string;
const CheckIcon = require("../assets/check-icon.svg").default as string;
const ProfPicTemplate = require("../assets/profile-template.svg").default as string;

const EventInformation = () => {
    const navigate = useNavigate();
    const { email, token } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const { getEvents, getLoadedEvent } = useEventApi();
    const storedEventId = localStorage.getItem("event id");
    const { getEventLengths } = useGuestApi();

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
            })
            .catch(error => {
              console.error('There was an error!', error);
              setSelectedEvent(null);
            });

            getEventLengths(storedEventId)
            .then(response => {
              setGuests(response);
            })
            .catch(error => {
              console.error('There was an error!', error);
              setGuests([]);
            });
          } else {
            setSelectedEvent(null);
          }
        }
    }, [navigate]);

    const countGuestsByConfirmation = (confirmationType: string) => {
      if (!Array.isArray(guests)) return 0;
      return guests.filter(guest => guest.confirmation.toLowerCase() === confirmationType.toLowerCase()).length;
    };


    const handleEventSelect = (event: Event) => {
        setSelectedEvent(event);
        localStorage.setItem('event id', event.id.toString() || '');
        loadGuests(event.id);
    };

    const loadGuests = async (eventId: number) => {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        await getEventLengths(eventId.toString())
        .then(response => {
          setGuests(response);
        })
        .catch(error => {
          console.error('There was an error fetching the guests!', error);
          setGuests([]);
        });
    };

    if (!email) {
      return <LoadingPage message="Loading user data..." />;
    }

    return (
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -50, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="m-4 md:m-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#969696] mb-4">Dashboard &gt; <span className="text-[#608EC4]">Event Information</span></div>
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
          <div className="mb-4 md:mb-0 w-full md:w-auto sm:max-w-64">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between p-2 bg-white rounded shadow-xl drop-shadow-lg w-full md:w-auto">
                <span>Select Event Database</span>
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
          <div className="bg-white rounded-lg p-4 w-full md:w-auto">
            <div className="text-black text-xl font-bold">{selectedEvent ? selectedEvent.name : 'Select Event Database'}</div>
          </div>
        </div>
          <div className="flex flex-col md:flex-row justify-between space-x-3 mt-4 items-center h-auto">
            <div className="w-full md:w-auto">
              {selectedEvent && <EventProfile event={selectedEvent} />}
            </div>
            <div className="w-full md:w-1/4 mt-4 md:mt-0">
              <div className="bg-white rounded-lg p-4 h-full flex flex-col justify-center">
                <div className="text-left space-y-10">
                  <div className="space-y-3">
                    <div className="font-normal">Sales:</div>
                    <ProfileHolder email={selectedEvent ? selectedEvent.sales : '-'} imageSrc={ProfPicTemplate}/>
                  </div>
                  <div className="space-y-3">
                    <div className="font-normal">Account Manager:</div>
                    <ProfileHolder email={selectedEvent ? selectedEvent.account_manager : '-'} imageSrc={ProfPicTemplate}/>
                  </div>
                </div>
              </div>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col text-center items-center justify-center py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={InformationIcon} alt="i Icon" className="w-16"/>
            <div className="text-5xl font-bold">{guests.length || 0}</div>
            <div  className="font-semibold text-[#626262]">Data Invitation</div>
          </div>
          <div className="flex flex-col items-center justify-center justify-self-stretch py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={CheckIcon} alt="Check Icon" className="w-16"/>
            <div className="text-5xl font-bold">{countGuestsByConfirmation("confirmed") + countGuestsByConfirmation("represented")}</div>
            <div className="font-semibold text-[#25B380]">Confirmed</div>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={QuestionMarkIcon} alt="Question Icon" className="w-16"/>
            <div className="text-5xl font-bold">{countGuestsByConfirmation("to be confirmed")}</div>
            <div className="font-semibold text-[#FF8211]">To Be Confirmed</div>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-4 w-full max-w-80 md:w-3/4 flex-1 space-y-1 rounded-2xl bg-white">
            <img src={CrossIcon} alt="Cross Icon" className="w-16"/>
            <div className="text-5xl font-bold">{countGuestsByConfirmation("cancelled")}</div>
            <div className="font-semibold text-[#FF3111]">Cancelled</div>
          </div>
        </div>
      </motion.div>
    );
};

export default EventInformation;
