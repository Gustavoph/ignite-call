import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'

import { NextSeo } from 'next-seo'
import * as S from './styles'
import { Container, Header } from '../styles'
import { ArrowRight, Check } from 'phosphor-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()

  const hasAuthError = !!router.query.error
  const isSignedIn = session.status === 'authenticated'

  async function handleConnectCalendar() {
    signIn('google')
  }

  async function handleGoToNextStep() {
    await router.push('/register/time-intervals')
  }

  return (
    <>
      <NextSeo title="Conecte sua agenda do Google | Ignite Call" noindex />

      <Container>
        <Header>
          <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
          <Text>
            Conecte o seu calendário para verificar automaticamente as horas
            ocupadas e os novos eventos à medida em que são agendado
          </Text>

          <MultiStep size={4} currentStep={2} />
        </Header>

        <S.ConnectBox>
          <S.ConnectItem>
            <Text>Google Calendar</Text>
            {!isSignedIn && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleConnectCalendar}
              >
                Conectar
                <ArrowRight />
              </Button>
            )}
            {isSignedIn && (
              <Button size="sm" disabled>
                Conectado
                <Check />
              </Button>
            )}
          </S.ConnectItem>

          {hasAuthError && (
            <S.AuthError size="sm">
              Falha ao se conectar ao Google, verifique se você habilitou as
              permissões de acesso ao Google Calendar
            </S.AuthError>
          )}

          <Button
            type="submit"
            disabled={!isSignedIn}
            onClick={handleGoToNextStep}
          >
            Próximo passo
            <ArrowRight />
          </Button>
        </S.ConnectBox>
      </Container>
    </>
  )
}
