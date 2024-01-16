import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface TitleBoxProps {
  message: string;
  subtitle?: string | ReactNode;
  main?: ReactNode;
  footer?: ReactNode;
}

const TitleBox = ({ message, subtitle, footer, main }: TitleBoxProps) => {
  return (
    <Card className="max-w-[600px] mx-auto">
      <CardContent className="p-6 border-2 rounded-md hover:border-indigo-500/75 focus:border-indigo-500/7hover:border-indigo-500/75 transition-all hover:shadow-md duration-300">
        <article className="prose">
          <h1 className="!mb-1">{message}</h1>
          <p className="!mt-1">{subtitle}</p>
        </article>

        {main}

        {footer}
      </CardContent>
    </Card>
  );
};

export default TitleBox;
