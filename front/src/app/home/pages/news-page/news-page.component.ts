import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsItem {
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
  readTime: string;
}

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-page.component.html'
})
export class NewsPageComponent implements OnInit {
  newsList: NewsItem[] = [
    {
      title: 'Global Markets React to New Financial Regulations',
      category: 'Finance',
      date: 'Aug 6, 2026',
      summary: 'Markets around the world are adjusting to the newly implemented financial regulations aimed at increasing transparency and reducing risk for retail investors.',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1170&auto=format&fit=crop',
      readTime: '5 min read'
    },
    {
      title: 'Tech Startups Secure Record Funding in Q3',
      category: 'Technology',
      date: 'Aug 5, 2026',
      summary: 'Venture capital firms have poured a record amount of funding into early-stage tech startups this quarter, signaling strong confidence in the sector.',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1170&auto=format&fit=crop',
      readTime: '4 min read'
    },
    {
      title: 'Sustainable Energy Projects See Surge in Retail Investment',
      category: 'Sustainability',
      date: 'Aug 3, 2026',
      summary: 'Retail investors are increasingly allocating funds to green energy initiatives, driving significant growth in renewable infrastructure projects.',
      imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1170&auto=format&fit=crop',
      readTime: '6 min read'
    },
    {
      title: 'Central Banks Announce Interest Rate Adjustments',
      category: 'Economy',
      date: 'Aug 1, 2026',
      summary: 'Several major central banks have announced slight adjustments to interest rates in response to shifting inflation metrics.',
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1170&auto=format&fit=crop',
      readTime: '3 min read'
    },
    {
      title: 'New AI Frameworks Transforming Education Sector',
      category: 'Education',
      date: 'Jul 28, 2026',
      summary: 'Innovative AI-driven tools are being adopted by universities worldwide, providing personalized learning experiences for students.',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1232&auto=format&fit=crop',
      readTime: '7 min read'
    },
    {
      title: 'Healthcare Innovation Fund Reaches $500M Milestone',
      category: 'Health & Wellness',
      date: 'Jul 25, 2026',
      summary: 'A new fund dedicated entirely to healthcare and biotech startups has reached half a billion dollars, paving the way for rapid advancements.',
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbd15820?q=80&w=1176&auto=format&fit=crop',
      readTime: '4 min read'
    }
  ];

  ngOnInit(): void {}
}
