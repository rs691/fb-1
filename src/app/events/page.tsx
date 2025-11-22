
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Event } from "@/lib/types";

export default function EventsPage() {
    const firestore = useFirestore();
    const eventsCollection = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
    const { data: events, isLoading } = useCollection<Event>(eventsCollection);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Upcoming Events</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Join us for workshops, craft fairs, and more. Connect with our community and see our work in person.
        </p>
      </div>
      {isLoading && <p>Loading events...</p>}
      <div className="max-w-3xl mx-auto space-y-8">
        {events && events.map((event) => (
          <Card key={event.id} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{event.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.date), "MMMM d, yyyy 'at' h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{event.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
