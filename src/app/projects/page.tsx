
"use client";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";


export default function ProjectsPage() {
    const firestore = useFirestore();
    const projectsCollection = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
    const { data: projects, isLoading } = useCollection<Project>(projectsCollection);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Projects</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          A showcase of our custom work, from bespoke furniture to large-scale installations.
        </p>
      </div>
      {isLoading && <p>Loading projects...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects && projects.map((project) => {
          const projectImage = PlaceHolderImages.find(p => p.id === project.imageId);
          return (
          <Card key={project.id} className="overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
             {projectImage ? (
              <div className="relative h-80 w-full">
                <Image
                  src={projectImage.imageUrl}
                  alt={project.name}
                  fill
                  className="object-cover"
                   sizes="(max-width: 768px) 100vw, 50vw"
                  data-ai-hint={projectImage.imageHint}
                />
              </div>
            ) : (
                <div className="relative h-80 w-full bg-muted" />
            )}
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{project.description}</CardDescription>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">Completed: {format(new Date(project.dateCompleted), "MMMM yyyy")}</p>
            </CardFooter>
          </Card>
        )})}
      </div>
    </div>
  );
}
