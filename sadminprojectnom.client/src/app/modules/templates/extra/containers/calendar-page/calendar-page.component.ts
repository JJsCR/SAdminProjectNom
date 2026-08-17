import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbItem } from '../../../../../shared/ui-elements/breadcrumb/breadcrumb.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { colors, routes } from '../../../../../consts';
import { Calendar, CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { MatDialog } from '@angular/material/dialog';
import { DayInfoComponent } from '../../components/day-info/day-info.component';
import { NewDayEventComponent } from '../../components/new-day-event/new-day-event.component';
import { FullCalendarComponent } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { LiquidacionesService, Liquidacion } from '../../services/liquidaciones.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

enum CalendarViewsTypes {
  month = 'dayGridMonth',
  weeks = 'timeGridWeek',
  days = 'timeGridDay'
}

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss'],
  standalone: false
})
export class CalendarPageComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar', { static: false }) public calendarComponent: FullCalendarComponent;

  public calendarApi: Calendar;
  public calendarViewTypes: typeof CalendarViewsTypes = CalendarViewsTypes;
  public calendarView: string = this.calendarViewTypes.month;
  public routes: typeof routes = routes;
  public colors: typeof colors = colors;
  public calendarOptions: CalendarOptions = {};
  public events: any[] = [];
  public breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'Liquidaciones' },
  ];

  private workers: any[] = [];
  private projects: any[] = [];
  private liquidaciones: Liquidacion[] = [];

  constructor(
    public dialog: MatDialog,
    private liquidacionesService: LiquidacionesService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.calendarOptions = {
      initialView: this.calendarViewTypes.month,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      selectable: true,
      editable: false,
      headerToolbar: false,
      dateClick: this.onDateClick.bind(this),
      eventClick: this.onEventClick.bind(this),
    };

    this.loadData();
  }

  public ngAfterViewInit(): void {
    this.calendarApi = this.calendarComponent.getApi();
  }

  private loadData(): void {
    forkJoin({
      workers: this.http.get<any[]>('/api/workers'),
      projects: this.http.get<any[]>('/api/projects'),
      liquidaciones: this.liquidacionesService.getAll()
    }).subscribe({
      next: ({ workers, projects, liquidaciones }) => {
        this.workers = workers;
        this.projects = projects;
        this.liquidaciones = liquidaciones;
        this.events = liquidaciones.map(l => ({
          id: String(l.liquidacionId),
          title: `Pago: ${l.trabajadorNombre}`,
          start: l.fechaPago,
          backgroundColor: l.estado === 'Pagado' ? colors.GREEN : colors.YELLOW,
          textColor: '#fff',
          borderColor: 'transparent',
          extendedProps: { liquidacion: l }
        }));
      },
      error: (err) => console.error('Error cargando datos', err)
    });
  }

  public onDateClick(info: any): void {
    const fechaPago = info.dateStr; // yyyy-MM-dd

    const dialogRef = this.dialog.open(NewDayEventComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        fechaPago,
        workers: this.workers,
        projects: this.projects
      }
    });

    dialogRef.afterClosed().subscribe((result: Liquidacion | undefined) => {
      if (result) {
        this.loadData(); // Recargar eventos
      }
    });
  }

  public onEventClick({ event }: EventClickArg): void {
    const liquidacion: Liquidacion = event.extendedProps['liquidacion'];
    this.dialog.open(DayInfoComponent, {
      width: '600px',
      data: liquidacion
    });
  }

  public changeCalendarView(view: string): void {
    this.calendarView = view;
    this.calendarApi.changeView(view);
  }

  public today(): void {
    this.calendarApi.today();
  }

  public prev(): void {
    this.calendarApi.prev();
  }

  public next(): void {
    this.calendarApi.next();
  }
}
