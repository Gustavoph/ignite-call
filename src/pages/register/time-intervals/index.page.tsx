import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { z } from 'zod'
import { NextSeo } from 'next-seo'

import * as S from './styles'
import { Container, Header } from '../styles'
import { ArrowRight } from 'phosphor-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { getWeekDays } from '@/utils/get-week-days'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeStringToMinutes } from '@/utils/convert-time-string-to-minutes'
import { api } from '@/lib/axios'
import { useRouter } from 'next/router'

const formSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Vocêm precisa selecionar pelo menos um dia da semana!',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1 hora distante do inicio.',
      },
    ),
})

type FormInput = z.input<typeof formSchema>
type FormOutput = z.output<typeof formSchema>

export default function TimeIntervals() {
  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormInput>({
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
    resolver: zodResolver(formSchema),
  })

  const router = useRouter()

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as FormOutput
    await api.post('/users/time-intervals', { intervals })
    await router.push('/register/update-profile')
  }

  const weekDays = getWeekDays({ short: false })
  const intervals = watch('intervals')

  return (
    <>
      <NextSeo title="Atualize seu perfil | Ignite Call" noindex />

      <Container>
        <Header>
          <Heading as="strong">Quase lá</Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia
            da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />
        </Header>

        <S.IntervalBox
          as="form"
          onSubmit={handleSubmit(handleSetTimeIntervals)}
        >
          <S.IntervalsContainer>
            {fields.map((field, index) => {
              return (
                <S.IntervalItem key={field.id}>
                  <S.IntervalDay>
                    <Controller
                      control={control}
                      name={`intervals.${index}.enabled`}
                      render={({ field }) => (
                        <Checkbox
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true)
                          }}
                          checked={field.value}
                        />
                      )}
                    />
                    <Text>{weekDays[field.weekDay]}</Text>
                  </S.IntervalDay>

                  <S.IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      {...register(`intervals.${index}.startTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      {...register(`intervals.${index}.endTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                  </S.IntervalInputs>
                </S.IntervalItem>
              )
            })}
          </S.IntervalsContainer>

          {errors.intervals && (
            <S.FormError size="sm">{errors.intervals.message}</S.FormError>
          )}

          <Button type="submit" disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </S.IntervalBox>
      </Container>
    </>
  )
}
