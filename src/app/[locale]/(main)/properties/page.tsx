// app/[locale]/(main)/properties/page.tsx
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import PropertyFilters from "@/components/property/PropertyFilters";
import PropertyCard from "@/components/shared/PropertyCard";
import { Pagination, PaginationContent, PaginationItem,  PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Spline from "@splinetool/react-spline";
// Sakinisha: npx shadcn-ui@latest add pagination

const ITEMS_PER_PAGE = 9;

interface SearchParams {
  q?: string;
  amenities?: string;
  page?: string;
}

interface LocaleLayoutProps {
  searchParams: Promise<SearchParams> | undefined;
}


export default async function PropertiesPage({
  searchParams,
}: LocaleLayoutProps) {
  const awaitedParams = await (searchParams ?? Promise.resolve({})) as SearchParams;
  const currentPage = Number(awaitedParams.page ?? 1);

  const where: Prisma.PropertyWhereInput = {
    AND: [], 
  };

  if (awaitedParams?.q) {
    (where.AND as Prisma.PropertyWhereInput[]).push({
      OR: [
        { name: { contains: awaitedParams.q, mode: 'insensitive' } },
        { location: { contains: awaitedParams.q, mode: 'insensitive' } },
      ],
    });
  }

  if (awaitedParams?.amenities) {
    const amenities = awaitedParams.amenities.split(',');
    (where.AND as Prisma.PropertyWhereInput[]).push({
      amenities: { hasSome: amenities },
    });
  }
    
    const [properties, totalProperties] = await Promise.all([
        prisma.property.findMany({
            where,
            include: { rooms: true, _count: { select: { rooms: true } } },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto -mt-16">
            <header className="text-center mb-12 relative pt-30 py-16">

                <div className="absolute inset-0 z-0 opacity-50">
                       <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
                 </div>
                <h1 className="text-5xl font-extrabold orboto">Explore All Properties</h1>
                <p className="text-muted-foreground mt-2">Find the perfect space that fits your needs.</p>
     
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8  px-4 pb-12">
                {/* Sidebar ya Filters */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                        <PropertyFilters />
                    </div>
                </aside>

                {/* Grid ya Properties */}
                <main className="lg:col-span-3">
                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {properties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-secondary rounded-lg">
                            <h3 className="text-xl font-semibold">No Properties Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination className="mt-12">
                            <PaginationContent>
                                {currentPage > 1 && <PaginationItem><PaginationPrevious href={`?page=${currentPage - 1}`} /></PaginationItem>}
                                {/* Unaweza kuongeza namba za kurasa hapa */}
                                {currentPage < totalPages && <PaginationItem><PaginationNext href={`?page=${currentPage + 1}`} /></PaginationItem>}
                            </PaginationContent>
                        </Pagination>
                    )}
                </main>
            </div>
        </div>
    );
}