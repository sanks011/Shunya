import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function FeaturedSectionStats() {
  const data = [
    { name: "Jan", value: 20 },
    { name: "Feb", value: 40 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 80 },
    { name: "May", value: 100 },
    { name: "Jun", value: 130 },
    { name: "Jul", value: 160 },
  ];

  return (
    <section className="w-full mx-auto text-left py-32">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-lg sm:text-xl lg:text-4xl font-medium text-foreground mb-16">
          Powering teams with real-time insights.{" "}
          <span className="text-muted-foreground text-sm sm:text-base lg:text-4xl">
            Our next-gen analytics dashboard helps you track performance, manage
            clients, and make data-driven decisions in seconds.
          </span>
        </h3>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
          <div>
            <p className="text-3xl font-medium text-foreground">50,000+</p>
            <p className="text-muted-foreground text-md">Projects Managed</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-foreground">99.9%</p>
            <p className="text-muted-foreground text-md">Uptime Guarantee</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-foreground">1,200+</p>
            <p className="text-muted-foreground text-md">Enterprise Clients</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-foreground">1.2s</p>
            <p className="text-muted-foreground text-md">Avg. Response Time</p>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--card-foreground))"
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBlue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}