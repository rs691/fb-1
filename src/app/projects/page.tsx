
'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Project } from '@/lib/types';
import { collection } from 'firebase/firestore';

export default function ProjectsPage() {
  const firestore = useFirestore();
  const projectsCollection = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects, isLoading } = useCollection<Project>(projectsCollection);

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline tracking-tight lg:text-5xl">Project Showcase</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          From custom kitchens to statement pieces, see how we've brought our clients' visions to life.
        </p>
      </div>
      {isLoading && <p>Loading projects...</p>}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>div:not(:first-child)]:mt-4">
        {projects?.map((project) => {
          return (
            <div key={project.id} className="break-inside-avoid">
               <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {project.imageUrl && (
                  <div className="overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt="project image"
                      // alt={project.title}
                      width={800}
                      height={600}
                      className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                    <h3 className="font-semibold font-headline text-lg">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
